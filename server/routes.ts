/**
 * routes.ts
 * 
 * Definição das rotas da API do backend
 * Configura endpoints HTTP para comunicação frontend-backend
 * Utiliza interface de storage para operações de dados
 * Base para expansão de funcionalidades da API
 */

import type { Express } from "express"; // Tipagem do Express
import { createServer, type Server } from "http"; // Servidor HTTP
import { storage } from "./storage"; // Interface de armazenamento
import { insertAdminUserSchema, insertSiteConfigSchema, insertTestimonialSchema, insertFaqItemSchema, insertServiceSchema, insertPhotoCarouselSchema, insertSpecialtySchema, insertSupportMessageSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { optimizeImage, createMultipleFormats, getOptimizedPath, cleanupOriginal } from "./utils/imageOptimizer";
import { sendSupportEmail } from "./utils/emailService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configuração do Multer para upload de imagens
  const storage_multer = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadType = req.params.type; // 'hero' ou 'testimonials'
      const uploadPath = path.join(process.cwd(), 'uploads', uploadType);

      // Cria diretório se não existir
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // Gera nome único mantendo a extensão original
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
  });

  const upload = multer({ 
    storage: storage_multer,
    fileFilter: (req, file, cb) => {
      // Aceita apenas imagens
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Apenas arquivos de imagem são permitidos!'));
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB máximo
    }
  });

  // Serve static files with proper headers
  const express = await import('express');
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
    maxAge: '7d',
    etag: true,
    setHeaders: (res, filePath) => {
      // Add cache headers for images
      if (filePath.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)) {
        res.setHeader('Cache-Control', 'public, max-age=604800, immutable'); // 7 days
        res.setHeader('Vary', 'Accept-Encoding');
      }

      // Add WebP content type
      if (filePath.endsWith('.webp')) {
        res.setHeader('Content-Type', 'image/webp');
      }
    }
  }));

  // Authentication routes
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const admin = await storage.getAdminUser(username);

      if (!admin || admin.password !== password) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      // In a real app, you'd use JWT or sessions
      res.json({ success: true, admin: { id: admin.id, username: admin.username } });
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Site config routes
  app.get("/api/admin/config", async (req, res) => {
    try {
      const configs = await storage.getAllSiteConfigs();
      res.json(configs);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rota pública para configurações do site (sem autenticação)
  app.get("/api/config", async (req, res) => {
    try {
      const configs = await storage.getAllSiteConfigs();
      res.json(configs);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Endpoint público para verificar modo de manutenção (sem autenticação)
  app.get("/api/maintenance-check", async (req, res) => {
    try {
      const configs = await storage.getAllSiteConfigs();
      const maintenanceConfig = configs.find((c: any) => c.key === 'maintenance_mode');
      const generalConfig = configs.find((c: any) => c.key === 'general_info');

      res.json({
        maintenance: maintenanceConfig?.value || { enabled: false },
        general: generalConfig?.value || {}
      });
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/admin/config", async (req, res) => {
    try {
      const validatedData = insertSiteConfigSchema.parse(req.body);
      const config = await storage.setSiteConfig(validatedData);
      res.json(config);
    } catch (error) {
      res.status(400).json({ error: "Dados inválidos" });
    }
  });

  app.delete("/api/admin/config/:key", async (req, res) => {
    try {
      const key = req.params.key;
      await storage.deleteSiteConfig(key);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro ao remover configuração" });
    }
  });

  // Upload de favicon
  app.post("/api/admin/upload/favicon", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }

      const sharp = require('sharp');
      const fs = require('fs').promises;
      const path = require('path');

      // Criar diretório de ícones se não existir
      const iconsDir = path.join(process.cwd(), 'client', 'public', 'icons');
      await fs.mkdir(iconsDir, { recursive: true });

      // Converter e salvar diferentes tamanhos
      const inputBuffer = req.file.buffer;

      // Favicon ICO (32x32)
      await sharp(inputBuffer)
        .resize(32, 32)
        .png()
        .toFile(path.join(iconsDir, 'favicon.ico'));

      // Favicon 16x16 PNG
      await sharp(inputBuffer)
        .resize(16, 16)
        .png()
        .toFile(path.join(iconsDir, 'favicon-16x16.png'));

      // Favicon 32x32 PNG
      await sharp(inputBuffer)
        .resize(32, 32)
        .png()
        .toFile(path.join(iconsDir, 'favicon-32x32.png'));

      // Apple Touch Icon 180x180
      await sharp(inputBuffer)
        .resize(180, 180)
        .png()
        .toFile(path.join(iconsDir, 'apple-touch-icon.png'));

      res.json({ 
        success: true, 
        message: "Favicon atualizado com sucesso",
        files: ['favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png', 'apple-touch-icon.png']
      });
    } catch (error) {
      console.error('Erro no upload do favicon:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Deletar favicon (restaurar padrão)
  app.delete("/api/admin/upload/favicon", async (req, res) => {
    try {
      const fs = require('fs').promises;
      const path = require('path');

      const iconsDir = path.join(process.cwd(), 'client', 'public', 'icons');
      const iconFiles = ['favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png', 'apple-touch-icon.png'];

      // Remover ícones customizados se existirem
      for (const file of iconFiles) {
        try {
          await fs.unlink(path.join(iconsDir, file));
        } catch (error) {
          // Ignorar erro se arquivo não existir
        }
      }

      // Restaurar favicon padrão
      const defaultFaviconData = 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAABILAAASCwAAAAAAAAAAAAD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A';

      // Criar favicon padrão simples
      const sharp = require('sharp');
      const defaultIcon = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x20, 0x00, 0x00, 0x00, 0x20, 0x08, 0x06, 0x00, 0x00, 0x00, 0x73, 0x7A, 0x7A,
        0xF4, 0x00, 0x00, 0x00, 0x19, 0x74, 0x45, 0x58, 0x74, 0x53, 0x6F, 0x66, 0x74, 0x77, 0x61, 0x72,
        0x65, 0x00, 0x41, 0x64, 0x6F, 0x62, 0x65, 0x20, 0x49, 0x6D, 0x61, 0x67, 0x65, 0x52, 0x65, 0x61,
        0x64, 0x79, 0x71, 0xC9, 0x65, 0x3C, 0x00, 0x00, 0x03, 0x8D, 0x49, 0x44, 0x41, 0x54, 0x78, 0xDA
      ]);

      // Salvar favicon padrão
      await sharp({
        create: {
          width: 32,
          height: 32,
          channels: 4,
          background: { r: 236, g: 72, b: 153, alpha: 1 }
        }
      })
      .png()
      .toFile(path.join(iconsDir, 'favicon.ico'));

      res.json({ success: true, message: "Favicon restaurado para o padrão" });
    } catch (error) {
      console.error('Erro ao restaurar favicon:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Upload de ícone do site
  app.post("/api/admin/upload/site-icon", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: "Tipo de arquivo não suportado" });
      }

      // Processa a imagem usando Sharp para criar favicon
      const iconBuffer = await sharp(req.file.buffer)
        .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png()
        .toBuffer();

      const iconPath = `uploads/site-icon/favicon.png`;
      const fullIconPath = path.join(process.cwd(), iconPath);

      // Cria o diretório se não existir
      await fs.ensureDir(path.dirname(fullIconPath));

      // Salva o arquivo
      await fs.writeFile(fullIconPath, iconBuffer);

      res.json({ 
        path: `/${iconPath}`,
        message: "Ícone do site enviado com sucesso" 
      });
    } catch (error) {
      console.error("Erro no upload do ícone:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Deletar ícone do site
  app.delete("/api/admin/upload/site-icon", async (req, res) => {
    try {
      const iconPath = path.join(process.cwd(), 'uploads/site-icon/favicon.png');

      if (await fs.pathExists(iconPath)) {
        await fs.remove(iconPath);
      }

      res.json({ message: "Ícone removido com sucesso" });
    } catch (error) {
      console.error("Erro ao remover ícone:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Upload de imagens
  app.post("/api/admin/upload/:type", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }

      const uploadType = req.params.type;
      const imagePath = `/uploads/${uploadType}/${req.file.filename}`;

      // Se for upload de hero, atualiza a configuração
      if (uploadType === 'hero') {
        await storage.setSiteConfig({ key: 'hero_image', value: { path: imagePath } });
      }

      res.json({ 
        success: true, 
        imagePath: imagePath,
        filename: req.file.filename
      });
    } catch (error) {
      console.error('Erro no upload:', error);
      res.status(500).json({ error: "Erro ao fazer upload da imagem" });
    }
  });

  // Testimonials routes
  app.get("/api/testimonials", async (req, res) => {
    try {
      const testimonials = await storage.getActiveTestimonials();
      console.log('Depoimentos encontrados:', testimonials);
      res.json(testimonials);
    } catch (error) {
      console.error('Erro ao buscar testimonials:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/admin/testimonials", async (req, res) => {
    try {
      const testimonials = await storage.getAllTestimonials();
      res.json(testimonials);
    } catch (error) {
      console.error('Erro ao buscar testimonials (admin):', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/admin/testimonials", async (req, res) => {
    try {
      const testimonialData = insertTestimonialSchema.parse(req.body);
      const testimonial = await storage.createTestimonial(testimonialData);
      res.json(testimonial);
    } catch (error) {
      res.status(400).json({ error: "Dados inválidos" });
    }
  });

  app.put("/api/admin/testimonials/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const testimonialData = req.body;

      console.log("Atualizando depoimento:", { id, testimonialData });

      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const testimonial = await storage.updateTestimonial(id, testimonialData);

      console.log("Depoimento atualizado:", testimonial);

      res.json(testimonial);
    } catch (error) {
      console.error("Erro ao atualizar depoimento:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.delete("/api/admin/testimonials/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTestimonial(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // FAQ routes
  app.get("/api/faq", async (req, res) => {
    try {
      const faqItems = await storage.getActiveFaqItems();
      res.json(faqItems);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/admin/faq", async (req, res) => {
    try {
      const faqItems = await storage.getAllFaqItems();
      res.json(faqItems);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/admin/faq", async (req, res) => {
    try {
      const faqData = insertFaqItemSchema.parse(req.body);
      const faqItem = await storage.createFaqItem(faqData);
      res.json(faqItem);
    } catch (error) {
      res.status(400).json({ error: "Dados inválidos" });
    }
  });

  app.put("/api/admin/faq/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const faqData = req.body;
      const faqItem = await storage.updateFaqItem(id, faqData);
      res.json(faqItem);
    } catch (error) {
      res.status(400).json({ error: "Dados inválidos" });
    }
  });

  app.delete("/api/admin/faq/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFaqItem(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Services routes
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getActiveServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/admin/services", async (req, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/admin/services", async (req, res) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(serviceData);
      res.json(service);
    } catch (error) {
      res.status(400).json({ error: "Dados inválidos" });
    }
  });

  app.put("/api/admin/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const serviceData = req.body;
      const service = await storage.updateService(id, serviceData);
      res.json(service);
    } catch (error) {
      res.status(400).json({ error: "Dados inválidos" });
    }
  });

  app.delete("/api/admin/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteService(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Photo Carousel routes
  app.get("/api/photo-carousel", async (req, res) => {
    try {
      const photos = await storage.getActivePhotoCarousel();
      res.json(photos);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/admin/photo-carousel", async (req, res) => {
    try {
      const photos = await storage.getAllPhotoCarousel();
      res.json(photos);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/admin/photo-carousel", async (req, res) => {
    try {
      const photoData = insertPhotoCarouselSchema.parse(req.body);
      const photo = await storage.createPhotoCarousel(photoData);
      res.json(photo);
    } catch (error) {
      res.status(400).json({ error: "Dados inválidos" });
    }
  });

  app.put("/api/admin/photo-carousel/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const photoData = req.body;
      const photo = await storage.updatePhotoCarousel(id, photoData);
      res.json(photo);
    } catch (error) {
      res.status(400).json({ error: "Dados inválidos" });
    }
  });

  app.delete("/api/admin/photo-carousel/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePhotoCarousel(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Specialties routes
  app.get("/api/specialties", async (req, res) => {
    try {
      const specialties = await storage.getActiveSpecialties();
      res.json(specialties);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/admin/specialties", async (req, res) => {
    try {
      const specialties = await storage.getAllSpecialties();
      res.json(specialties);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/admin/specialties", async (req, res) => {
    try {
      const specialtyData = insertSpecialtySchema.parse(req.body);
      const specialty = await storage.createSpecialty(specialtyData);
      res.json(specialty);
    } catch (error) {
      res.status(400).json({ error: "Dados inválidos" });
    }
  });

  app.put("/api/admin/specialties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const specialtyData = req.body;
      const specialty = await storage.updateSpecialty(id, specialtyData);
      res.json(specialty);
    } catch (error) {
      res.status(400).json({ error: "Dados inválidos" });
    }
  });

  app.delete("/api/admin/specialties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSpecialty(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Contact settings routes
  app.get("/api/contact-settings", async (req, res) => {
    try {
      const contactSettings = await storage.getContactSettings();
      res.json(contactSettings);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/admin/contact-settings", async (req, res) => {
    try {
      const contactSettings = await storage.getContactSettings();
      res.json(contactSettings);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.put("/api/admin/contact-settings", async (req, res) => {
    try {
      const contactSettings = await storage.updateContactSettings(req.body);
      res.json(contactSettings);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Footer settings routes
  app.get("/api/footer-settings", async (req, res) => {
    try {
      const footerSettings = await storage.getFooterSettings();
      res.json(footerSettings);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/admin/footer-settings", async (req, res) => {
    try {
      const footerSettings = await storage.getFooterSettings();
      res.json(footerSettings);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.put("/api/admin/footer-settings", async (req, res) => {
    try {
      const footerSettings = await storage.updateFooterSettings(req.body);
      res.json(footerSettings);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Support message routes
  app.get("/api/admin/support-messages", async (req, res) => {
    try {
      const messages = await storage.getAllSupportMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/admin/support-messages", async (req, res) => {
    try {
      const messageData = insertSupportMessageSchema.parse(req.body);

      // Valores padrão para nome e email
      const finalData = {
        ...messageData,
        name: messageData.name || "Dra. Adrielle Benhossi",
        email: messageData.email || "contato@draadriellepsicologia.com"
      };

      // Salvar mensagem no banco
      const message = await storage.createSupportMessage(finalData);

      // Enviar email
      const emailResult = await sendSupportEmail({
        name: finalData.name,
        email: finalData.email,
        subject: finalData.subject,
        message: finalData.message,
        type: finalData.type,
        siteUrl: req.get('host') ? `${req.protocol}://${req.get('host')}` : undefined
      });

      if (!emailResult.success) {
        console.error('Falha ao enviar email:', emailResult.error);
        // Mesmo se o email falhar, salvamos a mensagem no banco
      }

      res.json({ 
        ...message, 
        emailSent: emailResult.success,
        emailError: emailResult.error 
      });
    } catch (error) {
      console.error('Erro ao criar mensagem de suporte:', error);
      res.status(400).json({ error: "Dados inválidos" });
    }
  });

  app.put("/api/admin/support-messages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const message = await storage.updateSupportMessage(id, updateData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ error: "Dados inválidos" });
    }
  });

  app.delete("/api/admin/support-messages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSupportMessage(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rota dinâmica para robots.txt baseada na configuração de indexação
  app.get("/robots.txt", async (req, res) => {
    try {
      const configs = await storage.getAllSiteConfigs();
      const marketingConfig = configs.find((c: any) => c.key === 'marketing_pixels');
      const marketingData = marketingConfig?.value as any || {};
      const enableGoogleIndexing = marketingData.enableGoogleIndexing ?? true;

      res.setHeader('Content-Type', 'text/plain');

      if (enableGoogleIndexing) {
        // Permitir indexação
        res.send(`User-agent: *
Allow: /

Sitemap: ${req.protocol}://${req.get('host')}/sitemap.xml`);
      } else {
        // Bloquear indexação
        res.send(`User-agent: *
Disallow: /`);
      }
    } catch (error) {
      // Fallback para permitir indexação em caso de erro
      res.setHeader('Content-Type', 'text/plain');
      res.send(`User-agent: *
Allow: /`);
    }
  });

  // Upload de imagem do hero
  app.post("/api/admin/hero/image", async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhuma imagem foi enviada" });
      }

      const originalPath = req.file.path;
      const optimizedPath = getOptimizedPath(originalPath);

      // Otimizar imagem para WebP
      await optimizeImage(originalPath, optimizedPath, {
        quality: 85,
        maxWidth: 1920,
        maxHeight: 1080
      });

      // Remover arquivo original
      await cleanupOriginal(originalPath);

      const imageUrl = `/uploads/hero/${path.basename(optimizedPath)}`;
      await storage.setSiteConfig({
        key: "hero_image_url",
        value: imageUrl
      });

      res.json({ imageUrl });
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Upload de avatar
  app.post("/api/admin/avatar", async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhuma imagem foi enviada" });
      }

      const originalPath = req.file.path;
      const optimizedPath = getOptimizedPath(originalPath);

      // Otimizar avatar para WebP (tamanho menor)
      await optimizeImage(originalPath, optimizedPath, {
        quality: 90,
        maxWidth: 400,
        maxHeight: 400
      });

      // Remover arquivo original
      await cleanupOriginal(originalPath);

      const avatarUrl = `/uploads/hero/${path.basename(optimizedPath)}`;
      await storage.setSiteConfig({
        key: "avatar_url",
        value: avatarUrl
      });

      res.json({ avatarUrl });
    } catch (error) {
      console.error("Erro ao fazer upload do avatar:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Upload de imagem para depoimento
  app.post("/api/admin/testimonials/:id/image", async (req, res) => {
    try {
      const testimonialId = parseInt(req.params.id);

      if (!req.file) {
        return res.status(400).json({ error: "Nenhuma imagem foi enviada" });
      }

      const originalPath = req.file.path;
      const optimizedPath = getOptimizedPath(originalPath);

      // Otimizar imagem do depoimento
      await optimizeImage(originalPath, optimizedPath, {
        quality: 85,
        maxWidth: 300,
        maxHeight: 300
      });

      // Remover arquivo original
      await cleanupOriginal(originalPath);

      const imageUrl = `/uploads/testimonials/${path.basename(optimizedPath)}`;

      await storage.updateTestimonial(testimonialId, {
        imageUrl
      });

      res.json({ imageUrl });
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
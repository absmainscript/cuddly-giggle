/**
 * storage.ts
 * 
 * Interface de armazenamento de dados para a aplicação
 * Implementação atual: DatabaseStorage com PostgreSQL
 * Suporte completo ao painel administrativo
 */

import type { 
  InsertUser, User, InsertAdminUser, AdminUser, 
  InsertSiteConfig, SiteConfig, InsertTestimonial, Testimonial, 
  InsertFaqItem, FaqItem, InsertService, Service,
  InsertPhotoCarousel, PhotoCarousel, InsertSpecialty, Specialty 
} from "@shared/schema";
import { 
  users, 
  adminUsers, 
  siteConfig, 
  testimonials, 
  faqItems, 
  services, 
  photoCarousel, 
  specialties,
  contactSettings,
  footerSettings,
  supportMessages,
  type User, 
  type AdminUser, 
  type SiteConfig, 
  type Testimonial, 
  type FaqItem, 
  type Service, 
  type PhotoCarousel,
  type Specialty,
  type InsertUser,
  type InsertAdminUser,
  type InsertSiteConfig,
  type InsertTestimonial,
  type InsertFaqItem,
  type InsertService,
  type InsertPhotoCarousel,
  type InsertSpecialty,
  type InsertSupportMessage
} from "@shared/schema";
import { db } from "./db";
import { eq, asc, desc } from "drizzle-orm";

// Interface comum para operações de armazenamento
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Admin methods
  getAdminUser(username: string): Promise<AdminUser | undefined>;
  createAdminUser(user: InsertAdminUser): Promise<AdminUser>;

  // Site config methods
  getSiteConfig(key: string): Promise<SiteConfig | undefined>;
  setSiteConfig(config: InsertSiteConfig): Promise<SiteConfig>;
  getAllSiteConfigs(): Promise<SiteConfig[]>;
  deleteSiteConfig(key: string): Promise<void>;

  // Testimonials methods
  getAllTestimonials(): Promise<Testimonial[]>;
  getActiveTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  updateTestimonial(id: number, testimonial: Partial<InsertTestimonial>): Promise<Testimonial>;
  deleteTestimonial(id: number): Promise<void>;

  // FAQ methods
  getAllFaqItems(): Promise<FaqItem[]>;
  getActiveFaqItems(): Promise<FaqItem[]>;
  createFaqItem(faq: InsertFaqItem): Promise<FaqItem>;
  updateFaqItem(id: number, faq: Partial<InsertFaqItem>): Promise<FaqItem>;
  deleteFaqItem(id: number): Promise<void>;

  // Services methods
  getAllServices(): Promise<Service[]>;
  getActiveServices(): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service>;
  deleteService(id: number): Promise<void>;

  // Photo Carousel methods
  getActivePhotoCarousel(): Promise<PhotoCarousel[]>;
  getAllPhotoCarousel(): Promise<PhotoCarousel[]>;
  createPhotoCarousel(data: InsertPhotoCarousel): Promise<PhotoCarousel>;
  updatePhotoCarousel(id: number, data: Partial<InsertPhotoCarousel>): Promise<PhotoCarousel>;
  deletePhotoCarousel(id: number): Promise<void>;

    // Specialties methods
  getActiveSpecialties(): Promise<Specialty[]>;
  getAllSpecialties(): Promise<Specialty[]>;
  createSpecialty(data: InsertSpecialty): Promise<Specialty>;
  updateSpecialty(id: number, data: Partial<InsertSpecialty>): Promise<Specialty>;
  deleteSpecialty(id: number): Promise<void>;

  // Contact Settings methods
  getContactSettings(): Promise<any>;
  updateContactSettings(updates: any): Promise<any>;

  // Footer Settings methods
  getFooterSettings(): Promise<any>;
  updateFooterSettings(updates: any): Promise<any>;

  // Support Messages methods
  getAllSupportMessages(): Promise<any>;
  createSupportMessage(data: InsertSupportMessage): Promise<any>;
  updateSupportMessage(id: number, data: Partial<InsertSupportMessage & { isRead?: boolean, adminResponse?: string }>): Promise<any>;
  deleteSupportMessage(id: number): Promise<void>;
}

// Implementação com banco de dados PostgreSQL
export class DatabaseStorage implements IStorage {
  db: any;
  constructor() {
      this.db = db;
  }
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await this.db.insert(users).values(insertUser).returning();
    return user;
  }

  // Admin methods
  async getAdminUser(username: string): Promise<AdminUser | undefined> {
    const [admin] = await this.db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return admin || undefined;
  }

  async createAdminUser(insertAdminUser: InsertAdminUser): Promise<AdminUser> {
    const [admin] = await this.db.insert(adminUsers).values(insertAdminUser).returning();
    return admin;
  }

  // Site config methods
  async getSiteConfig(key: string): Promise<SiteConfig | undefined> {
    const [config] = await this.db.select().from(siteConfig).where(eq(siteConfig.key, key));
    return config || undefined;
  }

  async setSiteConfig(config: InsertSiteConfig): Promise<SiteConfig> {
    const existing = await this.getSiteConfig(config.key);
    if (existing) {
      const [updated] = await this.db
        .update(siteConfig)
        .set({ value: config.value, updatedAt: new Date() })
        .where(eq(siteConfig.key, config.key))
        .returning();
      return updated;
    } else {
      const [created] = await this.db.insert(siteConfig).values(config).returning();
      return created;
    }
  }

  async getAllSiteConfigs(): Promise<SiteConfig[]> {
    return await this.db.select().from(siteConfig);
  }

  async deleteSiteConfig(key: string): Promise<void> {
    await this.db.delete(siteConfig).where(eq(siteConfig.key, key));
  }

  // Testimonials methods
  async getAllTestimonials(): Promise<Testimonial[]> {
    return await this.db.select().from(testimonials).orderBy(asc(testimonials.order));
  }

  async getActiveTestimonials(): Promise<Testimonial[]> {
    try {
      const result = await this.db.select().from(testimonials).where(eq(testimonials.isActive, true)).orderBy(asc(testimonials.order));
      console.log('Depoimentos ativos encontrados no storage:', result.length);
      console.log('Depoimentos:', result);
      return result;
    } catch (error) {
      console.error('Erro ao buscar depoimentos ativos:', error);
      return [];
    }
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const [created] = await this.db.insert(testimonials).values(testimonial).returning();
    return created;
  }

  async updateTestimonial(id: number, testimonial: Partial<InsertTestimonial>): Promise<Testimonial> {
    const [updated] = await this.db
      .update(testimonials)
      .set(testimonial)
      .where(eq(testimonials.id, id))
      .returning();
    return updated;
  }

  async deleteTestimonial(id: number): Promise<void> {
    await this.db.delete(testimonials).where(eq(testimonials.id, id));
  }

  // FAQ methods
  async getAllFaqItems(): Promise<FaqItem[]> {
    return await this.db.select().from(faqItems).orderBy(asc(faqItems.order));
  }

  async getActiveFaqItems(): Promise<FaqItem[]> {
    return await this.db.select().from(faqItems).where(eq(faqItems.isActive, true)).orderBy(asc(faqItems.order));
  }

  async createFaqItem(faq: InsertFaqItem): Promise<FaqItem> {
    const [created] = await this.db.insert(faqItems).values(faq).returning();
    return created;
  }

  async updateFaqItem(id: number, faq: Partial<InsertFaqItem>): Promise<FaqItem> {
    const [updated] = await this.db
      .update(faqItems)
      .set(faq)
      .where(eq(faqItems.id, id))
      .returning();
    return updated;
  }

  async deleteFaqItem(id: number): Promise<void> {
    await this.db.delete(faqItems).where(eq(faqItems.id, id));
  }

  // Services methods
  async getAllServices(): Promise<Service[]> {
    return await this.db.select().from(services).orderBy(asc(services.order));
  }

  async getActiveServices(): Promise<Service[]> {
    return await this.db.select().from(services).where(eq(services.isActive, true)).orderBy(asc(services.order));
  }

  async createService(service: InsertService): Promise<Service> {
    const [created] = await this.db.insert(services).values(service).returning();
    return created;
  }

  async updateService(id: number, service: Partial<InsertService>): Promise<Service> {
    const [updated] = await this.db
      .update(services)
      .set(service)
      .where(eq(services.id, id))
      .returning();
    return updated;
  }

  async deleteService(id: number): Promise<void> {
    await this.db.delete(services).where(eq(services.id, id));
  }

  // Photo Carousel methods
  async getActivePhotoCarousel(): Promise<PhotoCarousel[]> {
    return await this.db.select().from(photoCarousel).where(eq(photoCarousel.isActive, true)).orderBy(asc(photoCarousel.order));
  }

  async getAllPhotoCarousel(): Promise<PhotoCarousel[]> {
    return await this.db.select().from(photoCarousel).orderBy(asc(photoCarousel.order));
  }

  async createPhotoCarousel(data: InsertPhotoCarousel): Promise<PhotoCarousel> {
    const [result] = await this.db.insert(photoCarousel).values(data).returning();
    return result;
  }

  async updatePhotoCarousel(id: number, data: Partial<InsertPhotoCarousel>): Promise<PhotoCarousel> {
    const [result] = await this.db.update(photoCarousel).set(data).where(eq(photoCarousel.id, id)).returning();
    return result;
  }

  async deletePhotoCarousel(id: number): Promise<void> {
    await this.db.delete(photoCarousel).where(eq(photoCarousel.id, id));
  }

  // Specialties methods
  async getActiveSpecialties(): Promise<Specialty[]> {
    return await this.db.select().from(specialties).where(eq(specialties.isActive, true)).orderBy(asc(specialties.order));
  }

  async getAllSpecialties(): Promise<Specialty[]> {
    return await this.db.select().from(specialties).orderBy(asc(specialties.order));
  }

  async createSpecialty(data: InsertSpecialty): Promise<Specialty> {
    const [created] = await this.db.insert(specialties).values(data).returning();
    return created;
  }

  async updateSpecialty(id: number, data: Partial<InsertSpecialty>): Promise<Specialty> {
    const [updated] = await this.db
      .update(specialties)
      .set(data)
      .where(eq(specialties.id, id))
      .returning();
    return updated;
  }

  async deleteSpecialty(id: number): Promise<void> {
    await this.db.delete(specialties).where(eq(specialties.id, id));
  }

  async getContactSettings(): Promise<any> {
    try {
      const result = await this.db.select().from(contactSettings).limit(1);
      if (result.length === 0) {
        const defaultSettings = {
          contact_items: [
            {
              id: 1,
              type: "whatsapp",
              title: "WhatsApp",
              description: "(44) 998-362-704",
              icon: "FaWhatsapp",
              color: "#25D366",
              link: "https://wa.me/5544998362704",
              isActive: true,
              order: 0
            },
            {
              id: 2,
              type: "instagram",
              title: "Instagram",
              description: "@adriellebenhossi",
              icon: "FaInstagram",
              color: "#E4405F",
              link: "https://instagram.com/adriellebenhossi",
              isActive: true,
              order: 1
            },
            {
              id: 3,
              type: "email",
              title: "Email",
              description: "escutapsi@adrielle.com.br",
              icon: "Mail",
              color: "#EA4335",
              link: "mailto:escutapsi@adrielle.com.br",
              isActive: true,
              order: 2
            }
          ],
          schedule_info: {
            weekdays: "Segunda à Sexta: 8h às 18h",
            saturday: "Sábado: 8h às 12h",
            sunday: "Domingo: Fechado",
            additional_info: "Horários flexíveis disponíveis",
            isActive: true
          },
          location_info: {
            city: "Campo Mourão, Paraná",
            maps_link: "https://maps.google.com/search/Campo+Mourão+Paraná",
            isActive: true
          }
        };

        const [created] = await this.db.insert(contactSettings).values(defaultSettings).returning();
        return created;
      }
      return result[0];
    } catch (error) {
      console.error('Error getting contact settings:', error);
      throw error;
    }
  }

  async updateContactSettings(updates: any): Promise<any> {
    try {
      const existing = await this.getContactSettings();
      const updatedData = {
        ...existing,
        ...updates,
      };

      const [updated] = await this.db
        .update(contactSettings)
        .set(updatedData)
        .where(eq(contactSettings.id, existing.id))
        .returning();

      return updated;
    } catch (error) {
      console.error('Error updating contact settings:', error);
      throw error;
    }
  }

  async getFooterSettings(): Promise<any> {
    try {
      const result = await this.db.select().from(footerSettings).limit(1);
      if (result.length === 0) {
        const defaultSettings = {
          general_info: {
            description: "Cuidando da sua saúde mental com carinho e dedicação",
            showCnpj: true,
            cnpj: "12.345.678/0001-90"
          },
          contact_buttons: [
            {
              id: 1,
              type: "whatsapp",
              label: "WhatsApp",
              icon: "FaWhatsapp",
              gradient: "from-green-400 to-green-500",
              link: "https://wa.me/5544998362704",
              isActive: true,
              order: 0
            },
            {
              id: 2,
              type: "instagram", 
              label: "Instagram",
              icon: "FaInstagram",
              gradient: "from-purple-400 to-pink-500",
              link: "https://instagram.com/adriellebenhossi",
              isActive: true,
              order: 1
            },
            {
              id: 3,
              type: "linkedin",
              label: "LinkedIn", 
              icon: "FaLinkedin",
              gradient: "from-blue-500 to-blue-600",
              link: "https://linkedin.com/in/adrielle-benhossi-75510034a",
              isActive: true,
              order: 2
            }
          ],
          certification_items: [
            {
              id: 1,
              title: "Atendimento",
              items: ["Presencial e Online", "Campo Mourão - PR", "Segunda à Sábado"],
              additionalInfo: "Atendimento particular<br/>Horários flexíveis",
              isActive: true,
              order: 0
            },
            {
              id: 2,
              title: "Certificações",
              items: ["Registrada no Conselho", "Federal de Psicologia", "Sigilo e ética profissional"],
              additionalInfo: "",
              isActive: true,
              order: 1
            }
          ],
          trust_seals: [
            {
              id: 1,
              label: "CFP",
              gradient: "from-blue-500 to-blue-600",
              isActive: true,
              order: 0
            },
            {
              id: 2,
              label: "🔒",
              gradient: "from-green-500 to-green-500", 
              isActive: true,
              order: 1
            },
            {
              id: 3,
              label: "⚖️",
              gradient: "from-purple-500 to-pink-500",
              isActive: true,
              order: 2
            }
          ],
          bottom_info: {
            copyright: "© 2024 Dra. Adrielle Benhossi • Todos os direitos reservados",
            certificationText: "Registrada no Conselho Federal de Psicologia<br/>Sigilo e ética profissional",
            madeWith: "Made with ♥ and ☕ by ∞"
          }
        };

        const [created] = await this.db.insert(footerSettings).values(defaultSettings).returning();
        return created;
      }
      return result[0];
    } catch (error) {
      console.error('Error getting footer settings:', error);
      throw error;
    }
  }

  async updateFooterSettings(updates: any): Promise<any> {
    try {
      const existing = await this.getFooterSettings();
      const updatedData = {
        ...existing,
        ...updates,
      };

      const [updated] = await this.db
        .update(footerSettings)
        .set(updatedData)
        .where(eq(footerSettings.id, existing.id))
        .returning();

      return updated;
    } catch (error) {
      console.error('Error updating footer settings:', error);
      throw error;
    }
  }

  // Support Messages
  async getAllSupportMessages() {
    return await this.db
      .select()
      .from(supportMessages)
      .orderBy(desc(supportMessages.createdAt));
  }

  async createSupportMessage(data: InsertSupportMessage) {
    const [message] = await this.db
      .insert(supportMessages)
      .values(data)
      .returning();
    return message;
  }

  async updateSupportMessage(id: number, data: Partial<InsertSupportMessage & { isRead?: boolean, adminResponse?: string }>) {
    const updateData: any = { ...data };

    if (data.adminResponse) {
      updateData.respondedAt = new Date();
    }

    const [updated] = await this.db
      .update(supportMessages)
      .set(updateData)
      .where(eq(supportMessages.id, id))
      .returning();

    return updated;
  }

  async deleteSupportMessage(id: number) {
    await this.db
      .delete(supportMessages)
      .where(eq(supportMessages.id, id));
  }
}

export const storage = new DatabaseStorage();
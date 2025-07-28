/**
 * schema.ts
 * 
 * Schemas do banco de dados compartilhados entre frontend e backend
 * Define tabelas PostgreSQL usando Drizzle ORM
 * Schemas de validação com Zod para type safety
 * Base para expansão do sistema de dados da aplicação
 */

import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core"; // Tipos do PostgreSQL
import { createInsertSchema } from "drizzle-zod"; // Bridge Drizzle-Zod  
import { z } from "zod"; // Validação de esquemas

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const siteConfig = pgTable("site_config", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});



export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  service: text("service").notNull(),
  testimonial: text("testimonial").notNull(),
  rating: integer("rating").notNull().default(5),
  gender: text("gender").notNull(),
  photo: text("photo"), // Caminho para a foto do cliente
  isActive: boolean("is_active").notNull().default(true),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const faqItems = pgTable("faq_items", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  gradient: text("gradient").notNull(),
  price: text("price"),
  duration: text("duration"),
  showPrice: boolean("show_price").notNull().default(false),
  showDuration: boolean("show_duration").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const photoCarousel = pgTable("photo_carousel", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  showText: boolean("show_text").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const specialties = pgTable("specialties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull().default("Brain"),
  iconColor: text("icon_color").notNull().default("#ec4899"),
  isActive: boolean("is_active").notNull().default(true),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contactSettings = pgTable("contact_settings", {
  id: serial("id").primaryKey(),
  contact_items: jsonb("contact_items").notNull().default([]),
  schedule_info: jsonb("schedule_info").notNull().default({}),
  location_info: jsonb("location_info").notNull().default({}),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const footerSettings = pgTable("footer_settings", {
  id: serial("id").primaryKey(),
  general_info: jsonb("general_info").notNull().default({}),
  contact_buttons: jsonb("contact_buttons").notNull().default([]),
  certification_items: jsonb("certification_items").notNull().default([]),
  trust_seals: jsonb("trust_seals").notNull().default([]),
  bottom_info: jsonb("bottom_info").notNull().default({}),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const supportMessages = pgTable("support_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("support"), // support, contact, feedback
  isRead: boolean("is_read").notNull().default(false),
  adminResponse: text("admin_response"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  respondedAt: timestamp("responded_at"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
});

export const insertSiteConfigSchema = createInsertSchema(siteConfig).omit({
  id: true,
  updatedAt: true,
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
  createdAt: true,
});



export const insertFaqItemSchema = createInsertSchema(faqItems).omit({
  id: true,
  createdAt: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
});

export const insertPhotoCarouselSchema = createInsertSchema(photoCarousel).omit({
  id: true,
  createdAt: true,
});

export const insertSpecialtySchema = createInsertSchema(specialties).omit({
  id: true,
  createdAt: true,
});

export const insertSupportMessageSchema = createInsertSchema(supportMessages).omit({
  id: true,
  createdAt: true,
  respondedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertSiteConfig = z.infer<typeof insertSiteConfigSchema>;
export type SiteConfig = typeof siteConfig.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonials.$inferSelect;
export type InsertFaqItem = z.infer<typeof insertFaqItemSchema>;
export type FaqItem = typeof faqItems.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;
export type InsertPhotoCarousel = z.infer<typeof insertPhotoCarouselSchema>;
export type PhotoCarousel = typeof photoCarousel.$inferSelect;
export type InsertSpecialty = z.infer<typeof insertSpecialtySchema>;
export type Specialty = typeof specialties.$inferSelect;
export type InsertSupportMessage = z.infer<typeof insertSupportMessageSchema>;
export type SupportMessage = typeof supportMessages.$inferSelect;

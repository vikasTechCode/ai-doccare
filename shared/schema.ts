import { pgTable, text, serial, integer, boolean, timestamp, real, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"),
  phone: text("phone"),
  address: text("address"),
  emergencyContact: text("emergency_contact"),
  role: text("role").notNull().default("patient"), // patient, doctor, admin
  createdAt: timestamp("created_at").defaultNow(),
});

export const medicalRecords = pgTable("medical_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  recordType: text("record_type").notNull(), // lab_result, prescription, x_ray, etc.
  filePath: text("file_path"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const vitals = pgTable("vitals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  systolicBP: integer("systolic_bp"),
  diastolicBP: integer("diastolic_bp"),
  heartRate: integer("heart_rate"),
  weight: real("weight"),
  height: real("height"),
  temperature: real("temperature"),
  bloodSugar: integer("blood_sugar"),
  recordedAt: timestamp("recorded_at").defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  appointmentDate: timestamp("appointment_date").notNull(),
  appointmentType: text("appointment_type").notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  dosage: text("dosage").notNull(),
  frequency: text("frequency").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  instructions: text("instructions"),
  isActive: boolean("is_active").default(true),
});

export const medicationLogs = pgTable("medication_logs", {
  id: serial("id").primaryKey(),
  medicationId: integer("medication_id").notNull(),
  takenAt: timestamp("taken_at").notNull(),
  wasTaken: boolean("was_taken").notNull(),
});

export const symptomAnalyses = pgTable("symptom_analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  symptoms: text("symptoms").notNull(),
  aiAnalysis: json("ai_analysis").notNull(),
  analyzedAt: timestamp("analyzed_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  message: text("message").notNull(),
  response: text("response").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  author: text("author").notNull(),
  readTime: text("read_time").notNull(),
  imageUrl: text("image_url"),
  publishedAt: timestamp("published_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertMedicalRecordSchema = createInsertSchema(medicalRecords).omit({
  id: true,
  uploadedAt: true,
});

export const insertVitalsSchema = createInsertSchema(vitals).omit({
  id: true,
  recordedAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

export const insertMedicationSchema = createInsertSchema(medications).omit({
  id: true,
});

export const insertMedicationLogSchema = createInsertSchema(medicationLogs).omit({
  id: true,
});

export const insertSymptomAnalysisSchema = createInsertSchema(symptomAnalyses).omit({
  id: true,
  analyzedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  publishedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type MedicalRecord = typeof medicalRecords.$inferSelect;
export type InsertMedicalRecord = z.infer<typeof insertMedicalRecordSchema>;
export type Vitals = typeof vitals.$inferSelect;
export type InsertVitals = z.infer<typeof insertVitalsSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Medication = typeof medications.$inferSelect;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type MedicationLog = typeof medicationLogs.$inferSelect;
export type InsertMedicationLog = z.infer<typeof insertMedicationLogSchema>;
export type SymptomAnalysis = typeof symptomAnalyses.$inferSelect;
export type InsertSymptomAnalysis = z.infer<typeof insertSymptomAnalysisSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;

import { 
  users, medicalRecords, vitals, appointments, medications, medicationLogs,
  symptomAnalyses, chatMessages, articles,
  type User, type InsertUser, type MedicalRecord, type InsertMedicalRecord,
  type Vitals, type InsertVitals, type Appointment, type InsertAppointment,
  type Medication, type InsertMedication, type MedicationLog, type InsertMedicationLog,
  type SymptomAnalysis, type InsertSymptomAnalysis, type ChatMessage, type InsertChatMessage,
  type Article, type InsertArticle
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Medical records
  getMedicalRecords(userId: number): Promise<MedicalRecord[]>;
  createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord>;
  deleteMedicalRecord(id: number): Promise<boolean>;
  
  // Vitals
  getVitals(userId: number, limit?: number): Promise<Vitals[]>;
  createVitals(vitals: InsertVitals): Promise<Vitals>;
  getLatestVitals(userId: number): Promise<Vitals | undefined>;
  
  // Appointments
  getAppointments(userId: number): Promise<Appointment[]>;
  getAllAppointments(): Promise<Appointment[]>;
  getAppointmentsByDoctor(doctorId: number): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment | undefined>;
  

  // Medications
  getMedications(userId: number): Promise<Medication[]>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  updateMedication(id: number, updates: Partial<Medication>): Promise<Medication | undefined>;
  logMedication(log: InsertMedicationLog): Promise<MedicationLog>;
  getMedicationLogs(medicationId: number): Promise<MedicationLog[]>;
  
  // Symptom analyses
  getSymptomAnalyses(userId: number): Promise<SymptomAnalysis[]>;
  createSymptomAnalysis(analysis: InsertSymptomAnalysis): Promise<SymptomAnalysis>;
  
  // Chat messages
  getChatMessages(userId: number, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
    // Articles
  getArticles(limit?: number): Promise<Article[]>;
  getArticlesByCategory(category: string): Promise<Article[]>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(
    id: number,
    updates: Partial<InsertArticle>
  ): Promise<Article | undefined>;
  deleteArticle(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private medicalRecords: Map<number, MedicalRecord> = new Map();
  private vitals: Map<number, Vitals> = new Map();
  private appointments: Map<number, Appointment> = new Map();
  private medications: Map<number, Medication> = new Map();
  private medicationLogs: Map<number, MedicationLog> = new Map();
  private symptomAnalyses: Map<number, SymptomAnalysis> = new Map();
  private chatMessages: Map<number, ChatMessage> = new Map();
  private articles: Map<number, Article> = new Map();
  
  private currentUserId = 1;
  private currentRecordId = 1;
  private currentVitalsId = 1;
  private currentAppointmentId = 1;
  private currentMedicationId = 1;
  private currentLogId = 1;
  private currentAnalysisId = 1;
  private currentMessageId = 1;
  private currentArticleId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create sample users
    const user1: User = {
      id: 1,
      username: "johndoe",
      email: "john@example.com",
      password: "hashedpassword",
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: "1990-01-15",
      gender: "male",
      phone: "(555) 123-4567",
      address: "123 Main St, City, State 12345",
      emergencyContact: "Jane Doe - (555) 987-6543",
      role: "patient",
      createdAt: new Date(),
    };
    
    const admin: User = {
  id: 2,
  username: "admin",
  email: "admin@doccare.com",
  password: "hashedpassword",
  firstName: "Admin",
  lastName: "User",
  dateOfBirth: null,
  gender: null,
  phone: null,
  address: null,
  emergencyContact: null,
  role: "admin",
  createdAt: new Date(),
};

    this.users.set(1, user1);
    this.users.set(2, admin);
    this.currentUserId = 3;

    // Sample articles
    const sampleArticles: Article[] = [
      {
        id: 1,
        title: "5 Essential Health Screenings for Adults",
        excerpt: "Learn about important health screenings that can help detect conditions early...",
        content: "Regular health screenings are crucial for maintaining good health...",
        category: "Preventive Care",
        author: "Dr. Sarah Wilson",
        readTime: "5 min read",
        imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56",
        publishedAt: new Date("2024-12-12"),
      },
      {
        id: 2,
        title: "Heart-Healthy Diet: What to Eat",
        excerpt: "Discover foods that support cardiovascular health and reduce risk factors...",
        content: "A heart-healthy diet can significantly reduce your risk of heart disease...",
        category: "Nutrition",
        author: "Dr. Michael Chen",
        readTime: "7 min read",
        imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061",
        publishedAt: new Date("2024-12-10"),
      },
      {
        id: 3,
        title: "Simple Exercises for Better Sleep",
        excerpt: "Light exercises and stretches that can improve your sleep quality...",
        content: "Regular physical activity can help you fall asleep faster...",
        category: "Fitness",
        author: "Dr. Lisa Johnson",
        readTime: "4 min read",
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
        publishedAt: new Date("2024-12-08"),
      },
    ];

    sampleArticles.forEach(article => {
      this.articles.set(article.id, article);
    });
    this.currentArticleId = 4;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
  const user: User = {
    ...insertUser,
    dateOfBirth: insertUser.dateOfBirth ?? null,
    gender: insertUser.gender ?? null,
    phone: insertUser.phone ?? null,
    address: insertUser.address ?? null,
    emergencyContact: insertUser.emergencyContact ?? null,
    role: insertUser.role ?? "patient",
    id: this.currentUserId++,
    createdAt: new Date(),
  };

  this.users.set(user.id, user);
  return user;
}

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Medical records
  async getMedicalRecords(userId: number): Promise<MedicalRecord[]> {
    return Array.from(this.medicalRecords.values()).filter(record => record.userId === userId);
  }

  async createMedicalRecord(
  insertRecord: InsertMedicalRecord
): Promise<MedicalRecord> {
  const record: MedicalRecord = {
    ...insertRecord,
    description: insertRecord.description ?? null,
    filePath: insertRecord.filePath ?? null,
    id: this.currentRecordId++,
    uploadedAt: new Date(),
  };

  this.medicalRecords.set(record.id, record);
  return record;
}

  async deleteMedicalRecord(id: number): Promise<boolean> {
    return this.medicalRecords.delete(id);
  }

  // Vitals
  async getVitals(userId: number, limit = 50): Promise<Vitals[]> {
    return Array.from(this.vitals.values())
      .filter(vital => vital.userId === userId)
      .sort((a, b) => (b.recordedAt?.getTime() || 0) - (a.recordedAt?.getTime() || 0))
      .slice(0, limit);
  }

  async createVitals(insertVitals: InsertVitals): Promise<Vitals> {
  const newVitals: Vitals = {
    ...insertVitals,
    systolicBP: insertVitals.systolicBP ?? null,
    diastolicBP: insertVitals.diastolicBP ?? null,
    heartRate: insertVitals.heartRate ?? null,
    weight: insertVitals.weight ?? null,
    height: insertVitals.height ?? null,
    temperature: insertVitals.temperature ?? null,
    bloodSugar: insertVitals.bloodSugar ?? null,
    id: this.currentVitalsId++,
    recordedAt: new Date(),
  };

  this.vitals.set(newVitals.id, newVitals);
  return newVitals;
}

  async getLatestVitals(userId: number): Promise<Vitals | undefined> {
    const userVitals = await this.getVitals(userId, 1);
    return userVitals[0];
  }

  // Appointments
  async getAppointments(userId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(apt => apt.patientId === userId);
  }
  async getAllAppointments(): Promise<Appointment[]> {
  return Array.from(this.appointments.values());
}

  async getAppointmentsByDoctor(doctorId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(apt => apt.doctorId === doctorId);
  }

  async createAppointment(
  insertAppointment: InsertAppointment
): Promise<Appointment> {
  const appointment: Appointment = {
    ...insertAppointment,
    status: insertAppointment.status ?? "scheduled",
    notes: insertAppointment.notes ?? null,
    id: this.currentAppointmentId++,
    createdAt: new Date(),
  };

  this.appointments.set(appointment.id, appointment);
  return appointment;
}

  async updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { ...appointment, ...updates };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  // Medications
  async getMedications(userId: number): Promise<Medication[]> {
    return Array.from(this.medications.values()).filter(med => med.userId === userId);
  }

  async createMedication(
  insertMedication: InsertMedication
): Promise<Medication> {
  const medication: Medication = {
    ...insertMedication,
    endDate: insertMedication.endDate ?? null,
    instructions: insertMedication.instructions ?? null,
    isActive: insertMedication.isActive ?? true,
    id: this.currentMedicationId++,
  };

  this.medications.set(medication.id, medication);
  return medication;
}

  async updateMedication(id: number, updates: Partial<Medication>): Promise<Medication | undefined> {
    const medication = this.medications.get(id);
    if (!medication) return undefined;
    
    const updatedMedication = { ...medication, ...updates };
    this.medications.set(id, updatedMedication);
    return updatedMedication;
  }

  async logMedication(insertLog: InsertMedicationLog): Promise<MedicationLog> {
    const log: MedicationLog = {
      ...insertLog,
      id: this.currentLogId++,
    };
    this.medicationLogs.set(log.id, log);
    return log;
  }

  async getMedicationLogs(medicationId: number): Promise<MedicationLog[]> {
    return Array.from(this.medicationLogs.values()).filter(log => log.medicationId === medicationId);
  }

  // Symptom analyses
  async getSymptomAnalyses(userId: number): Promise<SymptomAnalysis[]> {
    return Array.from(this.symptomAnalyses.values()).filter(analysis => analysis.userId === userId);
  }

  async createSymptomAnalysis(insertAnalysis: InsertSymptomAnalysis): Promise<SymptomAnalysis> {
    const analysis: SymptomAnalysis = {
      ...insertAnalysis,
      id: this.currentAnalysisId++,
      analyzedAt: new Date(),
    };
    this.symptomAnalyses.set(analysis.id, analysis);
    return analysis;
  }

  // Chat messages
  async getChatMessages(userId: number, limit = 50): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const message: ChatMessage = {
      ...insertMessage,
      id: this.currentMessageId++,
      createdAt: new Date(),
    };
    this.chatMessages.set(message.id, message);
    return message;
  }

  // Articles
  async getArticles(limit = 20): Promise<Article[]> {
    return Array.from(this.articles.values())
      .sort((a, b) => (b.publishedAt?.getTime() || 0) - (a.publishedAt?.getTime() || 0))
      .slice(0, limit);
  }

  async getArticlesByCategory(category: string): Promise<Article[]> {
    return Array.from(this.articles.values()).filter(article => article.category === category);
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
  const article: Article = {
    ...insertArticle,
    imageUrl: insertArticle.imageUrl ?? null,
    id: this.currentArticleId++,
    publishedAt: new Date(),
  };

  this.articles.set(article.id, article);
  return article;
}
  async updateArticle(
  id: number,
  updates: Partial<InsertArticle>
): Promise<Article | undefined> {
  const article = this.articles.get(id);

  if (!article) return undefined;

  const updatedArticle = { ...article, ...updates };
  this.articles.set(id, updatedArticle);

  return updatedArticle;
}

async deleteArticle(id: number): Promise<boolean> {
  return this.articles.delete(id);
}
}

export class DatabaseStorage implements IStorage {
  
async fixArticleImages() {
  await db.update(articles)
    .set({
      imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56",
    })
    .where(eq(articles.title, "5 Essential Health Screenings Everyone Should Have"));

  await db.update(articles)
    .set({
      imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061",
    })
    .where(eq(articles.title, "Understanding Your Blood Pressure Numbers"));

  await db.update(articles)
    .set({
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
    })
    .where(eq(articles.title, "The Importance of Mental Health in Overall Wellness"));
}


  async seedInitialData() {

    // Check if users already exist
    const existingUsers = await db.select().from(users);
    if (existingUsers.length > 0) {
      return; // Data already seeded
    }

    // Create default users
    await db.insert(users).values([
      {
        username: "patient",
        email: "patient@example.com",
        password: "password",
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: "1990-01-01",
        gender: "male",
        phone: "+1234567890",
        address: "123 Main St, Anytown, USA",
        emergencyContact: "Jane Doe - +0987654321",
        role: "patient"
      },
      {
        username: "doctor",
        email: "doctor@example.com",
        password: "password",
        firstName: "Dr. Sarah",
        lastName: "Smith",
        dateOfBirth: "1980-05-15",
        gender: "female",
        phone: "+1122334455",
        address: "456 Medical Center Dr, Health City, USA",
        emergencyContact: "Medical Center - +1122334400",
        role: "doctor"
      },
      {
        username: "admin",
        email: "admin@example.com",
        password: "password",
        firstName: "Admin",
        lastName: "User",
        dateOfBirth: "1985-10-20",
        gender: "other",
        phone: "+1555666777",
        address: "789 Admin Plaza, System City, USA",
        emergencyContact: "System Admin - +1555666700",
        role: "admin"
      }
    ]);

    // Create sample articles
    await db.insert(articles).values([
      {
        title: "5 Essential Health Screenings Everyone Should Have",
        content: "Regular health screenings are crucial for early detection and prevention of diseases. Here are five essential screenings that everyone should consider: 1. Blood Pressure Monitoring, 2. Cholesterol Testing, 3. Cancer Screenings, 4. Diabetes Testing, 5. Mental Health Assessments.",
        category: "Preventive Care",
        excerpt: "Learn about the most important health screenings for maintaining your wellness.",
        author: "Dr. Sarah Smith",
        readTime: "5 min read",
        imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56",
      },
      {
        title: "Understanding Your Blood Pressure Numbers",
        content: "Blood pressure readings consist of two numbers: systolic and diastolic. Understanding what these numbers mean can help you take control of your cardiovascular health. Normal blood pressure is typically below 120/80 mmHg.",
        category: "Heart Health",
        excerpt: "Decode your blood pressure readings and learn what they mean for your health.",
        author: "Dr. Michael Johnson",
        readTime: "4 min read",
        imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061",
      },
      {
        title: "The Importance of Mental Health in Overall Wellness",
        content: "Mental health is just as important as physical health. This article explores the connection between mental and physical wellness, and provides practical tips for maintaining good mental health through stress management, exercise, and social connections.",
        category: "Mental Health",
        excerpt: "Discover how mental health impacts your overall well-being.",
        author: "Dr. Emily Davis",
        readTime: "6 min read",
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
      }
    ]);
  }
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getMedicalRecords(userId: number): Promise<MedicalRecord[]> {
    return await db.select().from(medicalRecords).where(eq(medicalRecords.userId, userId));
  }

  async createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord> {
    const [newRecord] = await db
      .insert(medicalRecords)
      .values(record)
      .returning();
    return newRecord;
  }

  async deleteMedicalRecord(id: number): Promise<boolean> {
    const result = await db.delete(medicalRecords).where(eq(medicalRecords.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getVitals(userId: number, limit = 50): Promise<Vitals[]> {
    return await db
      .select()
      .from(vitals)
      .where(eq(vitals.userId, userId))
      .orderBy(desc(vitals.recordedAt))
      .limit(limit);
  }

  async createVitals(insertVitals: InsertVitals): Promise<Vitals> {
    const [newVitals] = await db
      .insert(vitals)
      .values(insertVitals)
      .returning();
    return newVitals;
  }

  async getLatestVitals(userId: number): Promise<Vitals | undefined> {
    const [latest] = await db
      .select()
      .from(vitals)
      .where(eq(vitals.userId, userId))
      .orderBy(desc(vitals.recordedAt))
      .limit(1);
    return latest || undefined;
  }

  async getAppointments(userId: number): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .where(eq(appointments.patientId, userId))
      .orderBy(desc(appointments.appointmentDate));
  }

  async getAllAppointments(): Promise<Appointment[]> {
  return await db
    .select()
    .from(appointments)
    .orderBy(desc(appointments.appointmentDate));
}

  async getAppointmentsByDoctor(doctorId: number): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .where(eq(appointments.doctorId, doctorId))
      .orderBy(desc(appointments.appointmentDate));
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [newAppointment] = await db
      .insert(appointments)
      .values(appointment)
      .returning();
    return newAppointment;
  }

  async updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment | undefined> {
    const [appointment] = await db
      .update(appointments)
      .set(updates)
      .where(eq(appointments.id, id))
      .returning();
    return appointment || undefined;
  }

  async getMedications(userId: number): Promise<Medication[]> {
    return await db
      .select()
      .from(medications)
      .where(eq(medications.userId, userId))
      .orderBy(desc(medications.startDate));
  }

  async createMedication(medication: InsertMedication): Promise<Medication> {
    const [newMedication] = await db
      .insert(medications)
      .values(medication)
      .returning();
    return newMedication;
  }

  async updateMedication(id: number, updates: Partial<Medication>): Promise<Medication | undefined> {
    const [medication] = await db
      .update(medications)
      .set(updates)
      .where(eq(medications.id, id))
      .returning();
    return medication || undefined;
  }

  async logMedication(log: InsertMedicationLog): Promise<MedicationLog> {
    const [newLog] = await db
      .insert(medicationLogs)
      .values(log)
      .returning();
    return newLog;
  }

  async getMedicationLogs(medicationId: number): Promise<MedicationLog[]> {
    return await db
      .select()
      .from(medicationLogs)
      .where(eq(medicationLogs.medicationId, medicationId))
      .orderBy(desc(medicationLogs.takenAt));
  }

  async getSymptomAnalyses(userId: number): Promise<SymptomAnalysis[]> {
    return await db
      .select()
      .from(symptomAnalyses)
      .where(eq(symptomAnalyses.userId, userId))
      .orderBy(desc(symptomAnalyses.analyzedAt));
  }

  async createSymptomAnalysis(analysis: InsertSymptomAnalysis): Promise<SymptomAnalysis> {
    const [newAnalysis] = await db
      .insert(symptomAnalyses)
      .values(analysis)
      .returning();
    return newAnalysis;
  }

  async getChatMessages(userId: number, limit = 50): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getArticles(limit = 20): Promise<Article[]> {
    return await db
      .select()
      .from(articles)
      .orderBy(desc(articles.publishedAt))
      .limit(limit);
  }

  async getArticlesByCategory(category: string): Promise<Article[]> {
    return await db
      .select()
      .from(articles)
      .where(eq(articles.category, category))
      .orderBy(desc(articles.publishedAt));
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const [newArticle] = await db
      .insert(articles)
      .values(article)
      .returning();
    return newArticle;
  }
  async updateArticle(
  id: number,
  updates: Partial<InsertArticle>
): Promise<Article | undefined> {
  const [updatedArticle] = await db
    .update(articles)
    .set(updates)
    .where(eq(articles.id, id))
    .returning();

  return updatedArticle || undefined;
}

async deleteArticle(id: number): Promise<boolean> {
  const deleted = await db
    .delete(articles)
    .where(eq(articles.id, id))
    .returning({ id: articles.id });

  return deleted.length > 0;
}

}

export const storage = new DatabaseStorage();

// Initialize the storage with seed data
storage.seedInitialData().catch(console.error);

// Fix images for existing articles
storage.fixArticleImages().catch(console.error);
  
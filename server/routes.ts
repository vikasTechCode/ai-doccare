import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { medicationLogs } from "@shared/schema";
import { 
  insertUserSchema, insertMedicalRecordSchema, insertVitalsSchema,
  insertAppointmentSchema, insertMedicationSchema, insertSymptomAnalysisSchema,
  insertChatMessageSchema, insertArticleSchema
} from "@shared/schema";
import { analyzeSymptoms, generateHealthScore } from "./services/openai";
import { z } from "zod";

import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { getMLChatResponse } from "./ml-chatbot/index";



const uploadDir = path.join(
  process.cwd(),
  "uploads",
  "medical-records"
);

fs.mkdirSync(uploadDir, { recursive: true });

const medicalRecordUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const extension = path.extname(file.originalname).toLowerCase();
      cb(null, `${crypto.randomUUID()}${extension}`);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, JPG, and PNG files are allowed"));
    }
  },
});



const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error: (error as Error).message });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ message: "Invalid login data" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const user = await storage.updateUser(id, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error updating user" });
    }
  });

  // Medical records
  app.get("/api/medical-records/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const records = await storage.getMedicalRecords(userId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Error fetching medical records" });
    }
  });

  
app.post(
  "/api/medical-records",
  medicalRecordUpload.single("file"),
  async (req, res) => {
    
    try {
      const recordData = insertMedicalRecordSchema.parse({
        ...req.body,
        userId: Number(req.body.userId),
        filePath: req.file
          ? `/api/medical-records/files/${req.file.filename}`
          : (req.body.filePath || ""),
      });

      const record = await storage.createMedicalRecord(recordData);
      res.json(record);
    } catch (error) {
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }

      res.status(400).json({
        message: "Invalid record data or upload",
        error: (error as Error).message,
      });
    }
  }
);


  

app.get("/api/medical-records/files/:filename", async (req, res) => {
  try {
    const filename = path.basename(req.params.filename);

    if (filename !== req.params.filename) {
      return res.status(400).json({ message: "Invalid filename" });
    }

    const userId = Number(req.query.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const records = await storage.getMedicalRecords(userId);

    const record = records.find(
      (item) =>
        item.filePath === `/api/medical-records/files/${filename}`
    );

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    if (req.query.download === "1") {
      return res.download(filePath, filename);
    }

    return res.sendFile(filePath);
  } catch {
    return res.status(500).json({
      message: "Unable to open medical record",
    });
  }
});



  app.delete("/api/medical-records/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteMedicalRecord(id);
      if (!deleted) {
        return res.status(404).json({ message: "Record not found" });
      }
      res.json({ message: "Record deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting record" });
    }
  });

  // Vitals
  app.get("/api/vitals/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const vitals = await storage.getVitals(userId, limit);
      res.json(vitals);
    } catch (error) {
      res.status(500).json({ message: "Error fetching vitals" });
    }
  });

  app.post("/api/vitals", async (req, res) => {
    try {
      const vitalsData = insertVitalsSchema.parse(req.body);
      const vitals = await storage.createVitals(vitalsData);
      res.json(vitals);
    } catch (error) {
      res.status(400).json({ message: "Invalid vitals data", error: (error as Error).message });
    }
  });

  app.get("/api/vitals/:userId/latest", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const vitals = await storage.getLatestVitals(userId);
      res.json(vitals);
    } catch (error) {
      res.status(500).json({ message: "Error fetching latest vitals" });
    }
  });

  // Appointments
  app.get("/api/appointments/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const appointments = await storage.getAppointments(userId);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching appointments" });
    }
  });

  

app.get("/api/doctor/appointments", async (req, res) => {
  try {
    const doctorId = Number(req.query.doctorId);

    if (!Number.isInteger(doctorId) || doctorId <= 0) {
      return res.status(400).json({ message: "Valid doctor ID required" });
    }

    const doctor = await storage.getUser(doctorId);

    if (!doctor || doctor.role !== "doctor") {
      return res.status(403).json({ message: "Doctor access required" });
    }

    const appointments = await storage.getAppointmentsByDoctor(doctorId);

    const appointmentsWithPatientNames = await Promise.all(
      appointments.map(async (appointment) => {
        const patient = await storage.getUser(appointment.patientId);

        return {
          ...appointment,
          patientName: patient
            ? `${patient.firstName ?? ""} ${patient.lastName ?? ""}`.trim() ||
              patient.username
            : "Unknown patient",
        };
      })
    );

    res.json(appointmentsWithPatientNames);
  } catch (error) {
    console.error("Failed to fetch doctor appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

app.patch("/api/doctor/appointments/:id/status", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const doctorId = Number(req.query.doctorId);
    const { status } = req.body;

    if (!Number.isInteger(id) || id <= 0 ||
        !Number.isInteger(doctorId) || doctorId <= 0) {
      return res.status(400).json({ message: "Invalid appointment or doctor ID" });
    }

    if (!["confirmed", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const doctor = await storage.getUser(doctorId);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(403).json({ message: "Doctor access required" });
    }

    const appointments = await storage.getAppointmentsByDoctor(doctorId);
    const assigned = appointments.find((appointment) => appointment.id === id);

    if (!assigned) {
      return res.status(404).json({ message: "Assigned appointment not found" });
    }

    if (!["pending", "scheduled"].includes(assigned.status.toLowerCase())) {
      return res.status(400).json({ message: "Appointment already processed" });
    }

    const updated = await storage.updateAppointment(id, { status });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update appointment" });
  }
});



app.post("/api/appointments", async (req, res) => {
  try {
    const body = {
      ...req.body,
      appointmentDate: new Date(req.body.appointmentDate),
    };
      
    const appointmentData = insertAppointmentSchema.parse({
  ...body,
  status: "pending",
});
const doctorId = Number(req.body.doctorId);

if (!Number.isInteger(doctorId)) {
  return res.status(400).json({
    message: "Please select a valid doctor.",
  });
}

const doctor = await storage.getUser(doctorId);

if (!doctor || doctor.role !== "doctor") {
  return res.status(400).json({
    message: "Selected doctor does not exist. Please select a valid doctor.",
  });
}
    const appointment = await storage.createAppointment(appointmentData);

    res.json(appointment);
  } catch (error) {
    res.status(400).json({
      message: "Invalid appointment data",
      error: (error as Error).message,
    });
  }
});

  
app.put("/api/appointments/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updates = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid appointment ID" });
    }

    const appointments = await storage.getAllAppointments();
    const existing = appointments.find((item) => item.id === id);

    if (!existing) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const currentStatus = String(existing.status).toLowerCase();
    const requestedStatus =
      typeof updates.status === "string"
        ? updates.status.toLowerCase()
        : undefined;

    // A cancelled appointment cannot be reopened through this route.
    if (currentStatus === "cancelled" && requestedStatus !== undefined) {
      return res.status(400).json({
        message: "Cancelled appointments cannot change status",
      });
    }

    // Only pending appointments can be confirmed or rejected.
    if (
      requestedStatus &&
      ["confirmed", "rejected"].includes(requestedStatus) &&
      !["pending", "scheduled"].includes(currentStatus)
    ) {
      return res.status(400).json({
        message: "Only pending appointments can be confirmed or rejected",
      });
    }

    const appointment = await storage.updateAppointment(id, updates);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    return res.json(appointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
    return res.status(500).json({ message: "Error updating appointment" });
  }
});


  // Medications
  

app.get("/api/medications", async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const medications = await storage.getMedications(userId);
    res.json(medications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching medications" });
  }
});


  app.get("/api/medications/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const medications = await storage.getMedications(userId);
      res.json(medications);
    } catch (error) {
      res.status(500).json({ message: "Error fetching medications" });
    }
  });

  app.post("/api/medications", async (req, res) => {
    try {
      const medicationData = insertMedicationSchema.parse({
  ...req.body,
  startDate: new Date(req.body.startDate),
  endDate: req.body.endDate ? new Date(req.body.endDate) : null,
});
      const medication = await storage.createMedication(medicationData);
      res.json(medication);
    } catch (error) {
      res.status(400).json({ message: "Invalid medication data", error: (error as Error).message });
    }
  });
  
app.get("/api/medication-logs", async (req, res) => {
  try {
    const logs = await db
      .select()
      .from(medicationLogs);

    res.json(logs);
  } catch (error) {
    console.error("Error fetching medication logs:", error);
    res.status(500).json({ message: "Error fetching medication logs" });
  }
});


  app.put("/api/medications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const medication = await storage.updateMedication(id, updates);
      if (!medication) {
        return res.status(404).json({ message: "Medication not found" });
      }
      res.json(medication);
    } catch (error) {
      res.status(500).json({ message: "Error updating medication" });
    }
  });

  
app.post("/api/medication-logs", async (req, res) => {
  try {
    const { medicationId, takenAt, wasTaken } = req.body;

    const [log] = await db
      .insert(medicationLogs)
      .values({
        medicationId: Number(medicationId),
        takenAt: new Date(takenAt),
        wasTaken: Boolean(wasTaken),
      })
      .returning();

    res.json(log);
  } catch (error) {
    console.error("Error logging medication:", error);
    res.status(500).json({ message: "Error logging medication" });
  }
});


  // Symptom analysis
  app.post("/api/analyze-symptoms", async (req, res) => {
    try {
      const { symptoms, userId } = req.body;
      if (!symptoms || !userId) {
        return res.status(400).json({ message: "Symptoms and userId are required" });
      }

      const analysis = await analyzeSymptoms(symptoms);
      
      // Store the analysis
      await storage.createSymptomAnalysis({
        userId: parseInt(userId),
        symptoms,
        aiAnalysis: analysis,
      });

      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Error analyzing symptoms", error: (error as Error).message });
    }
  });

  app.get("/api/symptom-analyses/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const analyses = await storage.getSymptomAnalyses(userId);
      res.json(analyses);
    } catch (error) {
      res.status(500).json({ message: "Error fetching symptom analyses" });
    }
  });

  // AI Health Assistant
 // AI Health Assistant — custom ML chatbot
app.post("/api/chat", async (req, res) => {
  try {
    const { message, userId } = req.body;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        message: "Please enter a message.",
      });
    }

    const response = await getMLChatResponse(message);

    if (userId !== undefined && userId !== null) {
      const parsedUserId = Number(userId);

      if (Number.isInteger(parsedUserId) && parsedUserId > 0) {
        await storage.createChatMessage({
          userId: parsedUserId,
          message: message.trim(),
          response,
        });
      }
    }

    return res.json({ response });
  } catch (error) {
    console.error("ML chatbot error:", error);
    return res.status(500).json({
      message: "Unable to process your message right now.",
    });
  }
});


  app.get("/api/chat/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const messages = await storage.getChatMessages(userId, limit);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Error fetching chat messages" });
    }
  });

  // Health score
  app.get("/api/health-score/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const vitals = await storage.getVitals(userId, 10);
      const medications = await storage.getMedications(userId);
      
      const score = await generateHealthScore(vitals, medications, {});
      res.json({ score });
    } catch (error) {
      res.status(500).json({ message: "Error calculating health score" });
    }
  });

  // Articles
  app.get("/api/articles", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const category = req.query.category as string;
      
      let articles;
      if (category) {
        articles = await storage.getArticlesByCategory(category);
      } else {
        articles = await storage.getArticles(limit);
      }
      
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Error fetching articles" });
    }
  });

  app.post("/api/articles", async (req, res) => {
    try {
      const articleData = insertArticleSchema.parse(req.body);
      const article = await storage.createArticle(articleData);
      res.json(article);
    } catch (error) {
      res.status(400).json({ message: "Invalid article data", error: (error as Error).message });
    }
  });

  app.put("/api/articles/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid article ID" });
    }

    const updates = insertArticleSchema.partial().parse(req.body);
    const article = await storage.updateArticle(id, updates);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json(article);
  } catch (error) {
    res.status(400).json({
      message: "Unable to update article",
      error: (error as Error).message,
    });
  }
});

app.delete("/api/articles/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid article ID" });
    }

    const deleted = await storage.deleteArticle(id);

    if (!deleted) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json({ message: "Article deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Unable to delete article" });
  }
});

  // Admin routes
  // Admin: Get all appointments
// Admin: View all appointments (read-only)
app.get("/api/admin/appointments", async (req, res) => {
  try {
    const appointments = await storage.getAllAppointments();

    const appointmentsWithNames = await Promise.all(
      appointments.map(async (appointment) => {
        const patient = await storage.getUser(appointment.patientId);
        const doctor = await storage.getUser(appointment.doctorId);

        if (!doctor || doctor.role !== "doctor") {
  console.log("Invalid appointment doctor:", {
    appointmentId: appointment.id,
    doctorId: appointment.doctorId,
    doctorName: doctor?.username,
    doctorRole: doctor?.role,
  });
}

        return {
          ...appointment,
          patientName: patient
            ? `${patient.firstName ?? ""} ${patient.lastName ?? ""}`.trim()
                || patient.username
            : "Unknown patient",
          doctorName:
  doctor && doctor.role === "doctor"
    ? `Dr. ${
        (`${doctor.firstName ?? ""} ${doctor.lastName ?? ""}`.trim()
          || doctor.username)
          .replace(/^(dr\.?\s*)+/i, "")
          .trim()
      }`
    : "Doctor record needs verification",
        };
      })
    );

    res.json(appointmentsWithNames);
  } catch (error) {
    console.error("Error fetching admin appointments:", error);
    res.status(500).json({
      message: "Error fetching appointments",
    });
  }
});



  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  // Admin: Create a doctor account
app.post("/api/admin/doctors", async (req, res) => {
  try {
    const doctorData = insertUserSchema.parse({
      ...req.body,
      role: "doctor", // Always create a doctor, never a patient/admin
    });

    const existingUsername = await storage.getUserByUsername(
      doctorData.username
    );

    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const existingEmail = await storage.getUserByEmail(doctorData.email);

    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const doctor = await storage.createUser(doctorData);
    const { password, ...safeDoctor } = doctor;

    return res.status(201).json(safeDoctor);
  } catch (error) {
    console.error("Create doctor error:", error);
    return res.status(400).json({
      message: "Could not create doctor",
      error: (error as Error).message,
    });
  }
});

  app.get("/api/admin/stats", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const articles = await storage.getArticles();
      
      res.json({
        totalUsers: users.length,
        totalArticles: articles.length,
        activeSessions: Math.floor(Math.random() * 100) + 50, // Mock data
        systemStatus: "healthy"
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching admin stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

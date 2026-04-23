import express from "express";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import cors from "cors";
import path from "path";
import fs from "fs";
import { db } from "./src/db/index.js";
import { images } from "./src/db/schema.js";
import { eq, and } from "drizzle-orm";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  
  // Serve uploaded fles
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // API Routes
  
  // Get images for a specific week and year
  app.get("/api/images", async (req, res) => {
    try {
      const { week, year } = req.query;
      if (!week || !year) {
        return res.status(400).json({ error: "Week and year are required" });
      }

      const weekNum = parseInt(week as string);
      const yearNum = parseInt(year as string);

      const items = await db.select()
        .from(images)
        .where(and(eq(images.weekNumber, weekNum), eq(images.year, yearNum)));

      res.json(items.map(item => ({
        ...item,
        terminologies: JSON.parse(item.terminologies)
      })));
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Upload an image and generate terminologies
  app.post("/api/images", upload.single('image'), async (req, res) => {
    try {
      const { weekNumber, year, dayOfWeek } = req.body;
      const file = req.file;

      if (!file || !weekNumber || !year || !dayOfWeek) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // 1. Process image with Gemini
      const ai = new GoogleGenAI({}); // SDK automatically reads GEMINI_API_KEY
      const imageBytes = fs.readFileSync(file.path);
      const base64EncodeString = imageBytes.toString("base64");
      
      let terminologies: string[] = [];
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              inlineData: {
                mimeType: file.mimetype,
                data: base64EncodeString,
              },
            },
            "Analyze this design and provide 5 to 10 professional design terminology keywords that describe its visual style, UI/UX patterns, layout, color palette, or typographic choices. Reply ONLY with a JSON array of strings."
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
        });
        
        const jsonStr = response.text?.trim() || "[]";
        terminologies = JSON.parse(jsonStr);
      } catch(aiError: any) {
        console.error("Gemini API Error:", aiError);
        
        // Detailed error for invalid/missing API key
        if(aiError?.message?.includes("API key not valid") || !process.env.GEMINI_API_KEY) {
            return res.status(401).json({ error: "Gemini API Key is invalid or missing. Please configure it in your Secrets panel." });
        }
        
        return res.status(500).json({ error: "Failed to generate design terms using AI. " + (aiError?.message || "") });
      }

      // 2. Save to database
      const url = `/uploads/${file.filename}`;
      const [inserted] = await db.insert(images).values({
        url,
        weekNumber: parseInt(weekNumber as string),
        year: parseInt(year as string),
        dayOfWeek: parseInt(dayOfWeek as string),
        terminologies: JSON.stringify(terminologies),
        createdAt: new Date(),
      }).returning();

      res.json({
        ...inserted,
        terminologies: JSON.parse(inserted.terminologies)
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.delete("/api/images/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(images).where(eq(images.id, parseInt(id)));
      res.json({ success: true });
    } catch(e) {
      console.error(e);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update terminologies (for deleting a specific term)
  app.patch("/api/images/:id/terminologies", async (req, res) => {
    try {
      const { id } = req.params;
      const { terminologies } = req.body;
      
      if (!Array.isArray(terminologies)) {
        return res.status(400).json({ error: "terminologies must be an array" });
      }

      await db.update(images)
        .set({ terminologies: JSON.stringify(terminologies) })
        .where(eq(images.id, parseInt(id)));

      res.json({ success: true, terminologies });
    } catch(e) {
      console.error(e);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

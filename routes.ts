import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import { promises as fs } from "fs";
import { 
  insertUserSchema,
  insertEloEntrySchema,
  insertDailyGoalSchema,
  insertCourseSchema,
  insertGoalSchema,
  insertGameAnalysisSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // User routes
  app.get("/api/user/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/user", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/user/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const user = await storage.updateUser(id, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ELO routes
  app.get("/api/elo/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const entries = await storage.getEloEntries(userId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/elo", async (req, res) => {
    try {
      const entryData = insertEloEntrySchema.parse(req.body);
      const entry = await storage.createEloEntry(entryData);
      res.json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid ELO entry data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/elo-stats/:userId/:period", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const period = req.params.period as "week" | "month" | "year";
      
      if (!["week", "month", "year"].includes(period)) {
        return res.status(400).json({ message: "Invalid period" });
      }
      
      const stats = await storage.getEloStats(userId, period);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Daily Goals routes
  app.get("/api/daily-goals/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const goals = await storage.getDailyGoals(userId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/daily-goals", async (req, res) => {
    try {
      const goalData = insertDailyGoalSchema.parse(req.body);
      const goal = await storage.createDailyGoal(goalData);
      res.json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/daily-goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const goal = await storage.updateDailyGoal(id, updates);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.json(goal);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/daily-goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteDailyGoal(id);
      if (!deleted) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Courses routes
  app.get("/api/courses/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const courses = await storage.getCourses(userId);
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/courses", async (req, res) => {
    try {
      const courseData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(courseData);
      res.json(course);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid course data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/courses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const course = await storage.updateCourse(id, updates);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/courses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCourse(id);
      if (!deleted) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Goals routes
  app.get("/api/goals/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const type = req.query.type as string | undefined;
      const goals = await storage.getGoals(userId, type);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const goalData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(goalData);
      res.json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const goal = await storage.updateGoal(id, updates);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.json(goal);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteGoal(id);
      if (!deleted) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Game Analysis routes
  app.get("/api/game-analyses/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const analyses = await storage.getGameAnalyses(userId);
      res.json(analyses);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/game-analyses", async (req, res) => {
    try {
      const analysisData = insertGameAnalysisSchema.parse(req.body);
      const analysis = await storage.createGameAnalysis(analysisData);
      res.json(analysis);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid analysis data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/game-analyses/single/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const analysis = await storage.getGameAnalysis(id);
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Chess engine analysis endpoint
  app.post("/api/analyze-position", async (req, res) => {
    try {
      const { fen, depth = 15 } = req.body;
      
      if (!fen) {
        return res.status(400).json({ message: "FEN position required" });
      }

      // Simple mock analysis - in a real app, you'd use Stockfish.js
      const mockAnalysis = {
        evaluation: 0.4,
        bestMove: "Nf3",
        principalVariation: ["Nf3", "d5", "d4", "Nf6"],
        depth: depth,
      };

      res.json(mockAnalysis);
    } catch (error) {
      res.status(500).json({ message: "Analysis error" });
    }
  });

  // Download archive endpoint
  app.get("/api/download", async (req, res) => {
    try {
      const archivePath = path.join(process.cwd(), "sword-tracker.tar.gz");
      
      // Check if file exists
      try {
        await fs.access(archivePath);
      } catch {
        return res.status(404).json({ message: "Archive file not found" });
      }

      // Set headers for download
      res.setHeader('Content-Disposition', 'attachment; filename="sword-tracker.tar.gz"');
      res.setHeader('Content-Type', 'application/gzip');
      
      // Stream the file
      const fileBuffer = await fs.readFile(archivePath);
      res.send(fileBuffer);
    } catch (error) {
      res.status(500).json({ message: "Download error" });
    }
  });

  // Download page endpoint
  app.get("/download", async (req, res) => {
    const downloadPage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Download Sword Tracker - Chess Learning App</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center">
    <div class="max-w-2xl mx-auto p-6">
        <div class="bg-white rounded-lg shadow-lg p-8">
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">⚔️ Sword Tracker</h1>
                <p class="text-gray-600">Chess Learning & Progress Tracking Application</p>
            </div>
            
            <div class="mb-6">
                <h2 class="text-xl font-semibold mb-4">📁 Source Code Archive</h2>
                <div class="bg-gray-50 rounded p-4 mb-4">
                    <p class="text-sm text-gray-700 mb-2">
                        <strong>File:</strong> sword-tracker.tar.gz
                    </p>
                    <p class="text-sm text-gray-700 mb-2">
                        <strong>Size:</strong> ~64KB
                    </p>
                    <p class="text-sm text-gray-700">
                        <strong>Contents:</strong> Complete React + Node.js application
                    </p>
                </div>
                
                <div class="flex gap-4">
                    <a href="/api/download" 
                       class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                       download="sword-tracker.tar.gz">
                        📥 Download Archive
                    </a>
                    <a href="/" 
                       class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors">
                        🔙 Back to App
                    </a>
                </div>
            </div>
            
            <div class="border-t pt-6">
                <h3 class="font-semibold mb-3">🚀 Setup Instructions</h3>
                <ol class="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    <li>Extract the archive: <code class="bg-gray-100 px-1 rounded">tar -xzf sword-tracker.tar.gz</code></li>
                    <li>Navigate to folder: <code class="bg-gray-100 px-1 rounded">cd sword-tracker</code></li>
                    <li>Install dependencies: <code class="bg-gray-100 px-1 rounded">npm install</code></li>
                    <li>Start development server: <code class="bg-gray-100 px-1 rounded">npm run dev</code></li>
                </ol>
            </div>
            
            <div class="border-t pt-6 mt-6">
                <h3 class="font-semibold mb-3">✨ Features Included</h3>
                <div class="grid grid-cols-2 gap-2 text-sm text-gray-700">
                    <div>• Dashboard with stats</div>
                    <div>• Daily goals management</div>
                    <div>• Course progress tracking</div>
                    <div>• ELO rating system</div>
                    <div>• Game analysis with chess engine</div>
                    <div>• Weekly/monthly/yearly goals</div>
                    <div>• Interactive chess board</div>
                    <div>• Responsive design</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(downloadPage);
  });

  const httpServer = createServer(app);
  return httpServer;
}

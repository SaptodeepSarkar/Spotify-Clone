import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import session from "express-session";
import multer, { type FileFilterCallback } from "multer";
import type { Request as MulterRequest } from "multer";
import path from "path";
import fs from "fs/promises";
import { z } from "zod";
import { insertSongSchema, insertPlaylistSchema } from "@shared/schema";

// Extend session type
declare module "express-session" {
  interface SessionData {
    userId: string;
    username: string;
    role: string;
  }
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: async (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
      const uploadsDir = path.join(process.cwd(), "uploads");
      await fs.mkdir(uploadsDir, { recursive: true });
      cb(null, uploadsDir);
    },
    filename: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  fileFilter: (req: Express.Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "spotify-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    })
  );

  // Serve uploaded files
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // Auth middleware
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden - Admin access required" });
    }
    next();
  };

  // ============ AUTH ROUTES ============
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);

      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check if user is suspended
      if (user.suspended) {
        if (user.suspendedUntil && new Date() > user.suspendedUntil) {
          // Suspension expired, unsuspend user
          await storage.updateUserSuspension(user.id, false, null, null);
        } else {
          return res.status(403).json({
            message: "Account suspended",
            suspendedUntil: user.suspendedUntil,
            reason: user.suspensionReason,
          });
        }
      }

      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.role = user.role;

      res.json({
        id: user.id,
        username: user.username,
        role: user.role,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
    });
  });

  // ============ SONG ROUTES ============
  app.get("/api/songs", requireAuth, async (req, res) => {
    try {
      const songs = await storage.getAllSongs();
      res.json(songs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch songs" });
    }
  });

  app.get("/api/songs/:id", requireAuth, async (req, res) => {
    try {
      const song = await storage.getSong(req.params.id);
      if (!song) {
        return res.status(404).json({ message: "Song not found" });
      }
      res.json(song);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch song" });
    }
  });

  app.post(
    "/api/songs",
    requireAdmin,
    upload.single("cover"),
    async (req: Request, res: Response) => {
      try {
        const file = (req as any).file;
        const songData = insertSongSchema.parse({
          title: req.body.title,
          artist: req.body.artist,
          album: req.body.album,
          duration: parseInt(req.body.duration),
          audioUrl: req.body.audioUrl,
          coverUrl: file ? `/uploads/${file.filename}` : undefined,
        });

        const song = await storage.createSong(songData);
        res.status(201).json(song);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: "Invalid song data", errors: error.errors });
        }
        res.status(500).json({ message: "Failed to create song" });
      }
    }
  );

  app.patch(
    "/api/songs/:id",
    requireAdmin,
    upload.single("cover"),
    async (req: Request, res: Response) => {
      try {
        const file = (req as any).file;
        const updateData: any = {};
        if (req.body.title) updateData.title = req.body.title;
        if (req.body.artist) updateData.artist = req.body.artist;
        if (req.body.album) updateData.album = req.body.album;
        if (req.body.duration) updateData.duration = parseInt(req.body.duration);
        if (req.body.audioUrl) updateData.audioUrl = req.body.audioUrl;
        if (file) updateData.coverUrl = `/uploads/${file.filename}`;

        const song = await storage.updateSong(req.params.id, updateData);
        if (!song) {
          return res.status(404).json({ message: "Song not found" });
        }
        res.json(song);
      } catch (error) {
        res.status(500).json({ message: "Failed to update song" });
      }
    }
  );

  app.delete("/api/songs/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteSong(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Song not found" });
      }
      res.json({ message: "Song deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete song" });
    }
  });

  // ============ USER MANAGEMENT ROUTES ============
  app.get("/api/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Don't send passwords to frontend
      const sanitizedUsers = users.map(({ password, ...user }) => user);
      res.json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users/:id/suspend", requireAdmin, async (req, res) => {
    try {
      const { days, reason } = req.body;
      const suspendedUntil = new Date();
      suspendedUntil.setDate(suspendedUntil.getDate() + (days || 7));

      const user = await storage.updateUserSuspension(
        req.params.id,
        true,
        suspendedUntil,
        reason || "No reason provided"
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...sanitizedUser } = user;
      res.json(sanitizedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to suspend user" });
    }
  });

  app.post("/api/users/:id/unsuspend", requireAdmin, async (req, res) => {
    try {
      const user = await storage.updateUserSuspension(req.params.id, false, null, null);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...sanitizedUser } = user;
      res.json(sanitizedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to unsuspend user" });
    }
  });

  // ============ PLAYLIST ROUTES ============
  app.get("/api/playlists", requireAuth, async (req, res) => {
    try {
      const playlists = await storage.getPlaylistsByUserId(req.session.userId!);
      res.json(playlists);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch playlists" });
    }
  });

  app.get("/api/playlists/:id", requireAuth, async (req, res) => {
    try {
      const playlist = await storage.getPlaylist(req.params.id);
      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
      }
      // Check if user owns this playlist
      if (playlist.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      res.json(playlist);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch playlist" });
    }
  });

  app.post("/api/playlists", requireAuth, async (req, res) => {
    try {
      const playlistData = insertPlaylistSchema.parse({
        name: req.body.name,
        userId: req.session.userId!,
        songIds: req.body.songIds || [],
      });

      const playlist = await storage.createPlaylist(playlistData);
      res.status(201).json(playlist);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid playlist data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create playlist" });
    }
  });

  app.patch("/api/playlists/:id", requireAuth, async (req, res) => {
    try {
      const playlist = await storage.getPlaylist(req.params.id);
      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
      }
      if (playlist.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const updateData: any = {};
      if (req.body.name) updateData.name = req.body.name;
      if (req.body.songIds) updateData.songIds = req.body.songIds;

      const updated = await storage.updatePlaylist(req.params.id, updateData);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update playlist" });
    }
  });

  app.delete("/api/playlists/:id", requireAuth, async (req, res) => {
    try {
      const playlist = await storage.getPlaylist(req.params.id);
      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
      }
      if (playlist.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const deleted = await storage.deletePlaylist(req.params.id);
      res.json({ message: "Playlist deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete playlist" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

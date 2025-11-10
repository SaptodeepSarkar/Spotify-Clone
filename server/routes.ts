// routes.ts
import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import session from "express-session";
import multer, { type FileFilterCallback } from "multer";
import path from "path";
import fs from "fs/promises";
import { z } from "zod";
import { insertSongSchema, insertPlaylistSchema, songUploadSchema } from "@shared/schema";
import { registerUserSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import { getAudioDuration } from "./utils/audioUtils";

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
      const uploadsDir = path.join(process.cwd(), "Songs");
      await fs.mkdir(uploadsDir, { recursive: true });
      cb(null, uploadsDir);
    },
    filename: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  fileFilter: (req: Express.Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
    const allowedAudioTypes = /mp3|wav|ogg|m4a|aac/;
    
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.fieldname === 'coverFile') {
      const isValidImage = allowedImageTypes.test(ext) && allowedImageTypes.test(file.mimetype);
      if (isValidImage) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed for cover"));
      }
    } else if (file.fieldname === 'audioFile') {
      const isValidAudio = allowedAudioTypes.test(ext);
      if (isValidAudio) {
        cb(null, true);
      } else {
        cb(new Error("Only audio files (mp3, wav, ogg, m4a, aac) are allowed"));
      }
    } else {
      cb(new Error("Invalid field name"));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for audio files
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

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password using bcrypt
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
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

      // Regenerate session to prevent session fixation attacks
      req.session.regenerate((err) => {
        if (err) {
          return res.status(500).json({ message: "Session error" });
        }

        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.role = user.role;

        res.json({
          id: user.id,
          username: user.username,
          role: user.role,
        });
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password } = registerUserSchema.parse(req.body);
  
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
  
      // Create user (password will be hashed in storage)
      const user = await storage.createUser({
        username,
        password,
      });
  
      // Regenerate session to prevent session fixation attacks
      req.session.regenerate((err) => {
        if (err) {
          return res.status(500).json({ message: "Session error" });
        }
  
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.role = user.role;
  
        res.status(201).json({
          id: user.id,
          username: user.username,
          role: user.role,
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid registration data", 
          errors: error.errors 
        });
      }
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
    upload.fields([
      { name: 'coverFile', maxCount: 1 },
      { name: 'audioFile', maxCount: 1 }
    ]),
    async (req: Request, res: Response) => {
      try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const coverFile = files['coverFile']?.[0];
        const audioFile = files['audioFile']?.[0];

        // Validate that we have either audio file or audio URL
        if (!audioFile && !req.body.audioUrl) {
          return res.status(400).json({ message: "Either audio file or audio URL is required" });
        }

        // Validate that we have either cover file or cover URL
        if (!coverFile && !req.body.coverImageUrl) {
          return res.status(400).json({ message: "Either cover file or cover URL is required" });
        }

        let duration = parseInt(req.body.duration) || 0;
        
        // If audio file is uploaded, extract duration from it
        if (audioFile) {
          try {
            duration = await getAudioDuration(audioFile.path);
          } catch (error) {
            console.error('Error extracting audio duration:', error);
            // Use manually provided duration if extraction fails
            if (!duration) {
              return res.status(400).json({ message: "Duration is required when uploading audio files" });
            }
          }
        }

        // Determine audio URL - either from uploaded file or provided URL
        let audioUrl = req.body.audioUrl;
        if (audioFile) {
          audioUrl = `http://127.0.0.1:8000/Songs/${audioFile.filename}`;
        }

        // Determine cover URL - either from uploaded file or provided URL
        let coverUrl = req.body.coverImageUrl;
        if (coverFile) {
          coverUrl = `http://127.0.0.1:8000/uploads/${coverFile.filename}`;
        }

        const songData = insertSongSchema.parse({
          title: req.body.title,
          artist: req.body.artist,
          album: req.body.album || "",
          duration: duration,
          audioUrl: audioUrl,
          coverUrl: coverUrl || null,
        });

        const song = await storage.createSong(songData);
        res.status(201).json(song);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: "Invalid song data", errors: error.errors });
        }
        console.error('Error creating song:', error);
        res.status(500).json({ message: "Failed to create song" });
      }
    }
  );

  app.patch(
    "/api/songs/:id",
    requireAdmin,
    upload.fields([
      { name: 'coverFile', maxCount: 1 },
      { name: 'audioFile', maxCount: 1 }
    ]),
    async (req: Request, res: Response) => {
      try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const coverFile = files['coverFile']?.[0];
        const audioFile = files['audioFile']?.[0];

        const updateData: any = {};
        if (req.body.title) updateData.title = req.body.title;
        if (req.body.artist) updateData.artist = req.body.artist;
        if (req.body.album) updateData.album = req.body.album;
        if (req.body.duration) updateData.duration = parseInt(req.body.duration);

        let duration = updateData.duration;

        // Handle audio file/URL update
        if (audioFile) {
          // Extract duration from new audio file
          try {
            duration = await getAudioDuration(audioFile.path);
            updateData.duration = duration;
          } catch (error) {
            console.error('Error extracting audio duration:', error);
            // Keep existing duration if extraction fails
            if (!duration) {
              const existingSong = await storage.getSong(req.params.id);
              if (existingSong) {
                updateData.duration = existingSong.duration;
              }
            }
          }
          updateData.audioUrl = `/uploads/${audioFile.filename}`;
        } else if (req.body.audioUrl) {
          updateData.audioUrl = req.body.audioUrl;
        }

        // Handle cover file/URL update
        if (coverFile) {
          updateData.coverUrl = `/uploads/${coverFile.filename}`;
        } else if (req.body.coverImageUrl) {
          updateData.coverUrl = req.body.coverImageUrl;
        }

        const song = await storage.updateSong(req.params.id, updateData);
        if (!song) {
          return res.status(404).json({ message: "Song not found" });
        }
        res.json(song);
      } catch (error) {
        console.error('Error updating song:', error);
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

  app.post(
    "/api/playlists",
    requireAuth,
    upload.single("cover"),
    async (req: Request, res: Response) => {
      try {
        const file = (req as any).file;
        
        // Get form data
        const { name, description, songIds } = req.body;
        
        if (!name) {
          return res.status(400).json({ message: "Playlist name is required" });
        }
      
        const playlistData = {
          name,
          description: description || null,
          coverUrl: file ? `/uploads/${file.filename}` : null,
          userId: req.session.userId!,
          songIds: songIds ? JSON.parse(songIds) : [],
        };
      
        const playlist = await storage.createPlaylist(playlistData);
        res.status(201).json(playlist);
      } catch (error) {
        console.error('Error creating playlist:', error);
        res.status(500).json({ message: "Failed to create playlist" });
      }
    }
  );

  // Add song to playlist endpoint
  app.post("/api/playlists/:id/add-song", requireAuth, async (req, res) => {
    try {
      const { songId } = req.body;
      
      if (!songId) {
        return res.status(400).json({ message: "Song ID is required" });
      }
    
      const playlist = await storage.getPlaylist(req.params.id);
      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
      }
    
      // Check if user owns this playlist
      if (playlist.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
    
      // Check if song exists
      const song = await storage.getSong(songId);
      if (!song) {
        return res.status(404).json({ message: "Song not found" });
      }
    
      const updatedPlaylist = await storage.addSongToPlaylist(req.params.id, songId);
      if (!updatedPlaylist) {
        return res.status(404).json({ message: "Playlist not found" });
      }
      
      res.json(updatedPlaylist);
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      res.status(500).json({ message: "Failed to add song to playlist" });
    }
  });

  app.post("/api/playlists/:id/remove-song", requireAuth, async (req, res) => {
    try {
      const { songId } = req.body;

      if (!songId) {
        return res.status(400).json({ message: "Song ID is required" });
      }

      const playlist = await storage.getPlaylist(req.params.id);
      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
      }

      // Check if user owns this playlist
      if (playlist.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const updatedPlaylist = await storage.removeSongFromPlaylist(req.params.id, songId);

      if (!updatedPlaylist) {
        return res.status(404).json({ message: "Playlist not found" });
      }

      res.json(updatedPlaylist);
    } catch (error) {
      console.error('Error removing song from playlist:', error);
      res.status(500).json({ message: "Failed to remove song from playlist" });
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
      if (!deleted) {
        return res.status(404).json({ message: "Playlist not found" });
      }

      res.json({ message: "Playlist deleted successfully", success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete playlist" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
// shared/schema.ts
import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().default("user"),
  suspended: z.boolean().default(false),
  suspendedUntil: z.date().nullable(),
  suspensionReason: z.string().nullable(),
});

export const songSchema = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string(),
  album: z.string(),
  duration: z.number(),
  coverUrl: z.string().nullable(),
  audioUrl: z.string(),
});

export const playlistSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  coverUrl: z.string().nullable(),
  userId: z.string(),
  songIds: z.array(z.string()).default([]),
  createdAt: z.date(),
});

// Insert schemas omit auto-generated fields
export const insertUserSchema = userSchema.omit({ 
  id: true, 
  role: true, 
  suspended: true,
  suspendedUntil: true,
  suspensionReason: true,
});

export const insertSongSchema = songSchema.omit({ 
  id: true,
});

export const insertPlaylistSchema = playlistSchema.omit({ 
  id: true,
  createdAt: true,
});

// Registration schema with password confirmation
export const registerUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Song upload schema supporting both file and URL uploads
export const songUploadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  artist: z.string().min(1, "Artist is required"),
  album: z.string().optional(),
  duration: z.number().min(1, "Duration must be at least 1 second"),
  // Audio can be either file or URL
  audioFile: z.any().optional(),
  audioUrl: z.string().url("Invalid URL").optional(),
  // Cover can be either file or URL
  coverFile: z.any().optional(),
  coverUrl: z.string().url("Invalid URL").optional(),
}).refine((data) => data.audioFile || data.audioUrl, {
  message: "Either audio file or audio URL must be provided",
  path: ["audioFile"],
}).refine((data) => data.coverFile || data.coverUrl, {
  message: "Either cover file or cover URL must be provided",
  path: ["coverFile"],
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Song = z.infer<typeof songSchema>;
export type InsertSong = z.infer<typeof insertSongSchema>;
export type Playlist = z.infer<typeof playlistSchema>;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type SongUpload = z.infer<typeof songUploadSchema>;
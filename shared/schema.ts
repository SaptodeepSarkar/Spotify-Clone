import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
  suspended: boolean("suspended").default(false),
  suspendedUntil: timestamp("suspended_until"),
  suspensionReason: text("suspension_reason"),
});

export const songs = pgTable("songs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  album: text("album").notNull(),
  duration: integer("duration").notNull(),
  coverUrl: text("cover_url"),
  audioUrl: text("audio_url").notNull(),
});

export const playlists = pgTable("playlists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  userId: varchar("user_id").notNull(),
  songIds: text("song_ids").array().notNull().default(sql`'{}'::text[]`),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSongSchema = createInsertSchema(songs).omit({
  id: true,
});

export const insertPlaylistSchema = createInsertSchema(playlists).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSong = z.infer<typeof insertSongSchema>;
export type Song = typeof songs.$inferSelect;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
export type Playlist = typeof playlists.$inferSelect;

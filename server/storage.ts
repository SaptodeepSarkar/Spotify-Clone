import { type User, type InsertUser, type Song, type InsertSong, type Playlist, type InsertPlaylist } from "@shared/schema";
import { db } from "./db";
import { users, songs, playlists } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserSuspension(id: string, suspended: boolean, suspendedUntil?: Date | null, suspensionReason?: string | null): Promise<User | undefined>;
  
  // Song operations
  getSong(id: string): Promise<Song | undefined>;
  getAllSongs(): Promise<Song[]>;
  createSong(song: InsertSong): Promise<Song>;
  updateSong(id: string, song: Partial<InsertSong>): Promise<Song | undefined>;
  deleteSong(id: string): Promise<boolean>;
  
  // Playlist operations
  getPlaylist(id: string): Promise<Playlist | undefined>;
  getPlaylistsByUserId(userId: string): Promise<Playlist[]>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  updatePlaylist(id: string, playlist: Partial<InsertPlaylist>): Promise<Playlist | undefined>;
  deletePlaylist(id: string): Promise<boolean>;
}

export class DbStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUserSuspension(
    id: string,
    suspended: boolean,
    suspendedUntil?: Date | null,
    suspensionReason?: string | null
  ): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set({ suspended, suspendedUntil, suspensionReason })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  // Song operations
  async getSong(id: string): Promise<Song | undefined> {
    const result = await db.select().from(songs).where(eq(songs.id, id));
    return result[0];
  }

  async getAllSongs(): Promise<Song[]> {
    return await db.select().from(songs);
  }

  async createSong(song: InsertSong): Promise<Song> {
    const result = await db.insert(songs).values(song).returning();
    return result[0];
  }

  async updateSong(id: string, song: Partial<InsertSong>): Promise<Song | undefined> {
    const result = await db
      .update(songs)
      .set(song)
      .where(eq(songs.id, id))
      .returning();
    return result[0];
  }

  async deleteSong(id: string): Promise<boolean> {
    const result = await db.delete(songs).where(eq(songs.id, id)).returning();
    return result.length > 0;
  }

  // Playlist operations
  async getPlaylist(id: string): Promise<Playlist | undefined> {
    const result = await db.select().from(playlists).where(eq(playlists.id, id));
    return result[0];
  }

  async getPlaylistsByUserId(userId: string): Promise<Playlist[]> {
    return await db.select().from(playlists).where(eq(playlists.userId, userId));
  }

  async createPlaylist(playlist: InsertPlaylist): Promise<Playlist> {
    const result = await db.insert(playlists).values(playlist).returning();
    return result[0];
  }

  async updatePlaylist(id: string, playlist: Partial<InsertPlaylist>): Promise<Playlist | undefined> {
    const result = await db
      .update(playlists)
      .set(playlist)
      .where(eq(playlists.id, id))
      .returning();
    return result[0];
  }

  async deletePlaylist(id: string): Promise<boolean> {
    const result = await db.delete(playlists).where(eq(playlists.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DbStorage();

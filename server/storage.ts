// storage.ts - UPDATED
import { type User, type InsertUser, type Song, type InsertSong, type Playlist, type InsertPlaylist } from "@shared/schema";
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const SONG_DIR = path.join(process.cwd(), 'Songs'); // Changed to song folder
const HTTP_SERVER_URL = 'http://localhost:8000'; // Python HTTP server URL

// Ensure data and song directories exist
async function ensureDirs() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
    
    try {
        await fs.access(SONG_DIR);
    } catch {
        await fs.mkdir(SONG_DIR, { recursive: true });
    }
}

// Generic file storage operations
async function readJSONFile<T>(filename: string): Promise<T[]> {
    try {
        const content = await fs.readFile(path.join(DATA_DIR, filename), 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        return [];
    }
}

async function writeJSONFile<T>(filename: string, data: T[]): Promise<void> {
    await ensureDirs();
    await fs.writeFile(
        path.join(DATA_DIR, filename),
        JSON.stringify(data, null, 2),
        'utf-8'
    );
}

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
    addSongToPlaylist(playlistId: string, songId: string): Promise<Playlist | undefined>;
    removeSongFromPlaylist(playlistId: string, songId: string): Promise<Playlist | undefined>;
}

export class JsonStorage implements IStorage {
    // User operations
    async getUser(id: string): Promise<User | undefined> {
        const users = await readJSONFile<User>('users.json');
        return users.find(user => user.id === id);
    }

    async getUserByUsername(username: string): Promise<User | undefined> {
        const users = await readJSONFile<User>('users.json');
        return users.find(user => user.username === username);
    }

    async createUser(insertUser: InsertUser): Promise<User> {
        const users = await readJSONFile<User>('users.json');
        
        // Check if username already exists
        const existingUser = users.find(user => user.username === insertUser.username);
        if (existingUser) {
            throw new Error("Username already exists");
        }

        // Hash password before storing
        const hashedPassword = await bcrypt.hash(insertUser.password, 12);

        const newUser: User = {
            id: randomUUID(),
            username: insertUser.username,
            password: hashedPassword,
            role: 'user',
            suspended: false,
            suspendedUntil: null,
            suspensionReason: null
        };
        
        users.push(newUser);
        await writeJSONFile('users.json', users);
        return newUser;
    }

    async getAllUsers(): Promise<User[]> {
        return await readJSONFile<User>('users.json');
    }

    async updateUserSuspension(
        id: string,
        suspended: boolean,
        suspendedUntil?: Date | null,
        suspensionReason?: string | null
    ): Promise<User | undefined> {
        const users = await readJSONFile<User>('users.json');
        const userIndex = users.findIndex(user => user.id === id);
        if (userIndex === -1) return undefined;

        users[userIndex] = {
            ...users[userIndex],
            suspended,
            suspendedUntil: suspendedUntil || null,
            suspensionReason: suspensionReason || null
        };
        await writeJSONFile('users.json', users);
        return users[userIndex];
    }

    // Song operations
    async getSong(id: string): Promise<Song | undefined> {
        const songs = await readJSONFile<Song>('songs.json');
        return songs.find(song => song.id === id);
    }

    async getAllSongs(): Promise<Song[]> {
        return await readJSONFile<Song>('songs.json');
    }

    async createSong(song: InsertSong): Promise<Song> {
        const songs = await readJSONFile<Song>('songs.json');
        const newSong: Song = {
            id: randomUUID(),
            ...song,
            coverUrl: song.coverUrl || null
        };
        songs.push(newSong);
        await writeJSONFile('songs.json', songs);
        return newSong;
    }

    async updateSong(id: string, songUpdate: Partial<InsertSong>): Promise<Song | undefined> {
        const songs = await readJSONFile<Song>('songs.json');
        const songIndex = songs.findIndex(song => song.id === id);
        if (songIndex === -1) return undefined;

        songs[songIndex] = {
            ...songs[songIndex],
            ...songUpdate,
            coverUrl: songUpdate.coverUrl || songs[songIndex].coverUrl
        };
        await writeJSONFile('songs.json', songs);
        return songs[songIndex];
    }

    async deleteSong(id: string): Promise<boolean> {
        const songs = await readJSONFile<Song>('songs.json');
        const initialLength = songs.length;
        const filteredSongs = songs.filter(song => song.id !== id);
        if (filteredSongs.length === initialLength) return false;
        await writeJSONFile('songs.json', filteredSongs);
        return true;
    }

    // Playlist operations
    async getPlaylist(id: string): Promise<Playlist | undefined> {
        const playlists = await readJSONFile<Playlist>('playlists.json');
        return playlists.find(playlist => playlist.id === id);
    }

    async getPlaylistsByUserId(userId: string): Promise<Playlist[]> {
        const playlists = await readJSONFile<Playlist>('playlists.json');
        return playlists.filter(playlist => playlist.userId === userId);
    }

    async createPlaylist(playlist: InsertPlaylist): Promise<Playlist> {
        const playlists = await readJSONFile<Playlist>('playlists.json');
        const newPlaylist: Playlist = {
            id: randomUUID(),
            ...playlist,
            description: playlist.description || null,
            coverUrl: playlist.coverUrl || null,
            songIds: playlist.songIds || [],
            createdAt: new Date()
        };
        playlists.push(newPlaylist);
        await writeJSONFile('playlists.json', playlists);
        return newPlaylist;
    }

    async updatePlaylist(id: string, playlistUpdate: Partial<InsertPlaylist>): Promise<Playlist | undefined> {
        const playlists = await readJSONFile<Playlist>('playlists.json');
        const playlistIndex = playlists.findIndex(playlist => playlist.id === id);
        if (playlistIndex === -1) return undefined;

        playlists[playlistIndex] = {
            ...playlists[playlistIndex],
            ...playlistUpdate,
            description: playlistUpdate.description !== undefined ? playlistUpdate.description : playlists[playlistIndex].description,
            coverUrl: playlistUpdate.coverUrl !== undefined ? playlistUpdate.coverUrl : playlists[playlistIndex].coverUrl,
            songIds: playlistUpdate.songIds || playlists[playlistIndex].songIds
        };
        await writeJSONFile('playlists.json', playlists);
        return playlists[playlistIndex];
    }

    async deletePlaylist(id: string): Promise<boolean> {
        const playlists = await readJSONFile<Playlist>('playlists.json');
        const initialLength = playlists.length;
        const filteredPlaylists = playlists.filter(playlist => playlist.id !== id);
        if (filteredPlaylists.length === initialLength) return false;
        await writeJSONFile('playlists.json', filteredPlaylists);
        return true;
    }

    // Add song to playlist
    async addSongToPlaylist(playlistId: string, songId: string): Promise<Playlist | undefined> {
        const playlists = await readJSONFile<Playlist>('playlists.json');
        const playlistIndex = playlists.findIndex(playlist => playlist.id === playlistId);
        if (playlistIndex === -1) return undefined;

        const playlist = playlists[playlistIndex];
        
        // Check if song already exists in playlist
        if (!playlist.songIds.includes(songId)) {
            playlist.songIds.push(songId);
            await writeJSONFile('playlists.json', playlists);
        }
        
        return playlist;
    }

    // Remove song from playlist
    async removeSongFromPlaylist(playlistId: string, songId: string): Promise<Playlist | undefined> {
      const playlists = await readJSONFile<Playlist>('playlists.json');
      const playlistIndex = playlists.findIndex(playlist => playlist.id === playlistId);
      if (playlistIndex === -1) return undefined;
        
      const playlist = playlists[playlistIndex];
        
      // Check if song exists in playlist before removing
      if (!playlist.songIds.includes(songId)) {
        return playlist; // Return unchanged playlist if song not found
      }
      
      playlist.songIds = playlist.songIds.filter(id => id !== songId);
      await writeJSONFile('playlists.json', playlists);
      
      return playlist;
    }
}

// Create and export storage instance
export const storage = new JsonStorage();
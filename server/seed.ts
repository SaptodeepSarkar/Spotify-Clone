import { storage } from "./storage";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  // Create admin user with hashed password
  const adminPassword = await bcrypt.hash("admin123", 10);
  const adminUser = await storage.createUser({
    username: "admin",
    password: adminPassword,
    role: "admin",
  });
  console.log("Created admin user:", adminUser.username);

  // Create regular users with hashed password
  const userPassword = await bcrypt.hash("user123", 10);
  const regularUser = await storage.createUser({
    username: "user",
    password: userPassword,
    role: "user",
  });
  console.log("Created regular user:", regularUser.username);

  // Create some songs
  const songsData = [
    {
      title: "Blinding Lights",
      artist: "The Weeknd",
      album: "After Hours",
      duration: 200,
      audioUrl: "https://example.com/blinding-lights.mp3",
    },
    {
      title: "Levitating",
      artist: "Dua Lipa",
      album: "Future Nostalgia",
      duration: 203,
      audioUrl: "https://example.com/levitating.mp3",
    },
    {
      title: "Save Your Tears",
      artist: "The Weeknd",
      album: "After Hours",
      duration: 215,
      audioUrl: "https://example.com/save-your-tears.mp3",
    },
    {
      title: "Peaches",
      artist: "Justin Bieber",
      album: "Justice",
      duration: 198,
      audioUrl: "https://example.com/peaches.mp3",
    },
    {
      title: "Good 4 U",
      artist: "Olivia Rodrigo",
      album: "SOUR",
      duration: 178,
      audioUrl: "https://example.com/good-4-u.mp3",
    },
    {
      title: "Stay",
      artist: "The Kid LAROI & Justin Bieber",
      album: "F*ck Love 3",
      duration: 141,
      audioUrl: "https://example.com/stay.mp3",
    },
  ];

  for (const songData of songsData) {
    const song = await storage.createSong(songData);
    console.log("Created song:", song.title);
  }

  // Create a sample playlist
  const songs = await storage.getAllSongs();
  const playlist = await storage.createPlaylist({
    name: "My Favorites",
    userId: regularUser.id,
    songIds: songs.slice(0, 3).map((s) => s.id),
  });
  console.log("Created playlist:", playlist.name);

  console.log("Seeding complete!");
}

seed().catch(console.error);

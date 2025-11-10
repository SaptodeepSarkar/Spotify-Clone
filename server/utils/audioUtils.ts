// utils/audioUtils.ts
import * as mm from 'music-metadata';
import path from 'path';

export async function getAudioDuration(filePath: string): Promise<number> {
    try {
        const metadata = await mm.parseFile(filePath);
        // Duration is in seconds, rounded to nearest integer
        return Math.round(metadata.format.duration || 0);
    } catch (error) {
        console.error('Error reading audio duration:', error);
        return 0;
    }
}

export function isAudioFile(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    return ['.mp3', '.wav', '.ogg', '.m4a', '.aac'].includes(ext);
}

// Client-side duration extraction for file uploads
export const getAudioDurationFromFile = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const objectUrl = URL.createObjectURL(file);

    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(objectUrl);
      resolve(Math.floor(audio.duration));
    });

    audio.addEventListener('error', (e) => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load audio file'));
    });

    audio.src = objectUrl;
  });
};
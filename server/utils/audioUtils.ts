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
import { Play, Clock, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverUrl?: string;
}

interface SongTableProps {
  songs: Song[];
  onPlay: (songId: string) => void;
  onEdit?: (songId: string) => void;
  onDelete?: (songId: string) => void;
  isAdmin?: boolean;
}

export default function SongTable({ songs, onPlay, onEdit, onDelete, isAdmin = false }: SongTableProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-[50px_1fr_1fr_1fr_100px_50px] gap-4 px-4 py-2 text-sm text-muted-foreground border-b border-border">
        <div>#</div>
        <div>Title</div>
        <div>Album</div>
        <div>Artist</div>
        <div className="flex items-center justify-center">
          <Clock className="w-4 h-4" />
        </div>
        <div></div>
      </div>
      
      <div className="divide-y divide-border">
        {songs.map((song, index) => (
          <div
            key={song.id}
            className="grid grid-cols-[50px_1fr_1fr_1fr_100px_50px] gap-4 px-4 py-3 hover-elevate group items-center"
            data-testid={`row-song-${song.id}`}
          >
            <div className="text-sm text-muted-foreground group-hover:hidden" data-testid={`text-index-${song.id}`}>
              {index + 1}
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="hidden group-hover:flex w-8 h-8"
              onClick={() => onPlay(song.id)}
              data-testid={`button-play-row-${song.id}`}
            >
              <Play className="w-3 h-3 fill-current" />
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded overflow-hidden flex-shrink-0">
                {song.coverUrl ? (
                  <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                    No
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate" data-testid={`text-title-${song.id}`}>{song.title}</p>
              </div>
            </div>
            
            <div className="truncate text-sm" data-testid={`text-album-${song.id}`}>{song.album}</div>
            <div className="truncate text-sm text-muted-foreground" data-testid={`text-artist-row-${song.id}`}>{song.artist}</div>
            <div className="text-sm text-muted-foreground text-center" data-testid={`text-duration-${song.id}`}>
              {formatDuration(song.duration)}
            </div>
            
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" data-testid={`button-menu-${song.id}`}>
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(song.id)} data-testid={`menu-edit-${song.id}`}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete?.(song.id)} data-testid={`menu-delete-${song.id}`}>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

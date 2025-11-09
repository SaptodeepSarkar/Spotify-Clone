// PlaylistDetail.tsx - UPDATED
import { Play, MoreHorizontal, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePlayer } from "@/contexts/PlayerContext";
import type { Song, Playlist } from "@shared/schema";

interface PlaylistDetailProps {
  playlist: Playlist;
  songs: Song[];
  onBack: () => void;
}

export default function PlaylistDetail({ playlist, songs, onBack }: PlaylistDetailProps) {
  const { playSong, setQueue } = usePlayer();

  // Filter songs that are in this playlist
  const playlistSongs = songs.filter(song => 
    playlist.songIds?.includes(song.id)
  );

  const handlePlayPlaylist = () => {
    if (playlistSongs.length > 0) {
      setQueue(playlistSongs);
      playSong(playlistSongs[0]);
    }
  };

  const handlePlaySong = (song: Song) => {
    setQueue(playlistSongs);
    playSong(song);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = playlistSongs.reduce((total, song) => total + song.duration, 0);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          ← Back
        </Button>
        
        <div className="flex items-end gap-6 flex-1">
          <Card className="w-48 h-48 bg-muted rounded-md overflow-hidden flex items-center justify-center">
            {playlist.coverUrl ? (
              <img 
                src={playlist.coverUrl} 
                alt={playlist.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center text-muted-foreground p-4">
                <div className="text-4xl mb-2">🎵</div>
                <p className="text-sm">No Cover</p>
              </div>
            )}
          </Card>
          
          <div className="flex-1">
            <p className="text-sm font-medium mb-2">Playlist</p>
            <h1 className="text-6xl font-bold mb-4">{playlist.name}</h1>
            {playlist.description && (
              <p className="text-muted-foreground mb-4 text-lg">{playlist.description}</p>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Created by You</span>
              <span>•</span>
              <span>{playlistSongs.length} songs</span>
              <span>•</span>
              <span>{formatDuration(totalDuration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <Button
          size="lg"
          className="w-14 h-14 rounded-full"
          onClick={handlePlayPlaylist}
          disabled={playlistSongs.length === 0}
          data-testid="button-play-playlist"
        >
          <Play className="w-6 h-6 fill-current" />
        </Button>
        
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="w-6 h-6" />
        </Button>
      </div>

      {/* Songs List */}
      <div className="mt-8">
        <div className="grid grid-cols-[50px_1fr_1fr_1fr_100px] gap-4 px-4 py-2 text-sm text-muted-foreground border-b border-border">
          <div>#</div>
          <div>Title</div>
          <div>Album</div>
          <div>Artist</div>
          <div className="flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        
        <div className="divide-y divide-border">
          {playlistSongs.map((song, index) => (
            <div
              key={song.id}
              className="grid grid-cols-[50px_1fr_1fr_1fr_100px] gap-4 px-4 py-3 hover-elevate group items-center cursor-pointer"
              onClick={() => handlePlaySong(song)}
              data-testid={`playlist-song-${song.id}`}
            >
              <div className="text-sm text-muted-foreground group-hover:hidden">
                {index + 1}
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="hidden group-hover:flex w-8 h-8"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlaySong(song);
                }}
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
                  <p className="font-medium text-sm truncate">{song.title}</p>
                </div>
              </div>
              
              <div className="truncate text-sm">{song.album}</div>
              <div className="truncate text-sm text-muted-foreground">{song.artist}</div>
              <div className="text-sm text-muted-foreground text-center">
                {formatDuration(song.duration)}
              </div>
            </div>
          ))}
        </div>

        {playlistSongs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">This playlist is empty</p>
            <Button variant="outline">Add Songs</Button>
          </div>
        )}
      </div>
    </div>
  );
}
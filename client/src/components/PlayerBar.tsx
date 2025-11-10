// PlayerBar.tsx - UPDATED
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface PlayerBarProps {
  currentSong?: {
    id: string;
    title: string;
    artist: string;
    coverUrl?: string;
  };
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onShuffle: () => void;
  onRepeat: () => void;
  onAddToPlaylist: () => void;
  shuffle: boolean;
  repeat: boolean;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
}

export default function PlayerBar({
  currentSong,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  onShuffle,
  onRepeat,
  onAddToPlaylist,
  shuffle,
  repeat,
  currentTime,
  duration,
  onSeek,
  volume,
  onVolumeChange,
}: PlayerBarProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-24 bg-card border-t border-card-border px-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-[220px]">
        {currentSong && (
          <>
            <div className="w-14 h-14 bg-muted rounded-md flex items-center justify-center overflow-hidden">
              {currentSong.coverUrl ? (
                <img src={currentSong.coverUrl} alt={currentSong.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-muted-foreground">No Cover</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate" data-testid="text-current-song">{currentSong.title}</p>
              <p className="text-xs text-muted-foreground truncate" data-testid="text-current-artist">{currentSong.artist}</p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={onAddToPlaylist}
              data-testid="button-add-to-playlist"
              title="Add to playlist"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      <div className="flex flex-col items-center gap-2 flex-1 max-w-2xl">
        <div className="flex items-center gap-4">
          <Button
            size="icon"
            variant="ghost"
            className={shuffle ? 'text-primary' : ''}
            onClick={onShuffle}
            data-testid="button-shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={onPrevious} data-testid="button-previous">
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            className="w-8 h-8"
            onClick={onPlayPause}
            data-testid="button-play-pause"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button size="icon" variant="ghost" onClick={onNext} data-testid="button-next">
            <SkipForward className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className={repeat ? 'text-primary' : ''}
            onClick={onRepeat}
            data-testid="button-repeat"
          >
            <Repeat className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full">
          <span className="text-xs text-muted-foreground w-10 text-right" data-testid="text-current-time">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            className="flex-1"
            onValueChange={([value]) => onSeek(value)}
            data-testid="slider-seek"
          />
          <span className="text-xs text-muted-foreground w-10" data-testid="text-duration">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 min-w-[150px] justify-end">
        <Volume2 className="w-4 h-4 text-muted-foreground" />
        <Slider
          value={[volume]}
          max={100}
          step={1}
          className="w-24"
          onValueChange={([value]) => onVolumeChange(value)}
          data-testid="slider-volume"
        />
      </div>
    </div>
  );
}
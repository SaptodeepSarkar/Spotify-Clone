import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SongCardProps {
  title: string;
  artist: string;
  coverUrl?: string;
  onPlay: () => void;
}

export default function SongCard({ title, artist, coverUrl, onPlay }: SongCardProps) {
  return (
    <Card className="p-4 hover-elevate active-elevate-2 cursor-pointer group" data-testid={`card-song-${title}`}>
      <div className="relative mb-4">
        <div className="aspect-square bg-muted rounded-md overflow-hidden">
          {coverUrl ? (
            <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
              No Cover
            </div>
          )}
        </div>
        <Button
          size="icon"
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          data-testid={`button-play-${title}`}
        >
          <Play className="w-4 h-4 fill-current" />
        </Button>
      </div>
      <h3 className="font-semibold text-sm mb-1 truncate" data-testid={`text-song-title-${title}`}>{title}</h3>
      <p className="text-xs text-muted-foreground truncate" data-testid={`text-artist-${title}`}>{artist}</p>
    </Card>
  );
}

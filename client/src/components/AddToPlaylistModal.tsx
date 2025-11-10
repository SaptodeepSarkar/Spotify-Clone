// AddToPlaylistModal.tsx - NEW FILE
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Music, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  songIds: string[];
}

interface AddToPlaylistModalProps {
  open: boolean;
  onClose: () => void;
  playlists: Playlist[];
  currentSongId: string;
  onCreatePlaylist: () => void;
  onAddToPlaylist: (playlistId: string, songId: string) => Promise<void>;
}

export default function AddToPlaylistModal({
  open,
  onClose,
  playlists,
  currentSongId,
  onCreatePlaylist,
  onAddToPlaylist,
}: AddToPlaylistModalProps) {
  const [loadingPlaylistId, setLoadingPlaylistId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAddToPlaylist = async (playlistId: string) => {
    setLoadingPlaylistId(playlistId);
    try {
      await onAddToPlaylist(playlistId, currentSongId);
      toast({
        title: "Song added to playlist",
        description: "The song has been successfully added to your playlist.",
      });
    } catch (error) {
      toast({
        title: "Failed to add song",
        description: "There was an error adding the song to the playlist.",
        variant: "destructive",
      });
    } finally {
      setLoadingPlaylistId(null);
    }
  };

  const isSongInPlaylist = (playlist: Playlist) => {
    return playlist.songIds.includes(currentSongId);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Playlist</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* Create New Playlist Button */}
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-14"
            onClick={onCreatePlaylist}
          >
            <Plus className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Create new playlist</div>
              <div className="text-xs text-muted-foreground">Make a new playlist with this song</div>
            </div>
          </Button>

          {/* Existing Playlists */}
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  <div className="w-12 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                    {playlist.coverUrl ? (
                      <img
                        src={playlist.coverUrl}
                        alt={playlist.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <Music className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{playlist.name}</h3>
                    {playlist.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {playlist.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {playlist.songIds.length} songs
                    </p>
                  </div>

                  {isSongInPlaylist(playlist) ? (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <Check className="w-4 h-4" />
                      <span>Added</span>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleAddToPlaylist(playlist.id)}
                      disabled={loadingPlaylistId === playlist.id}
                    >
                      {loadingPlaylistId === playlist.id ? "Adding..." : "Add"}
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {playlists.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No playlists yet</p>
                <p className="text-sm">Create your first playlist to get started</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
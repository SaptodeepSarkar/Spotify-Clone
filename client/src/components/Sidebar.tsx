// Sidebar.tsx - UPDATED
import { Home, Search, Library, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onPlaylistClick?: (playlistId: string) => void;
  userPlaylists?: { id: string; name: string; }[];
  onCreatePlaylist?: () => void;
}

export default function Sidebar({ 
  activePage, 
  onNavigate, 
  userPlaylists = [], 
  onCreatePlaylist,
  onPlaylistClick 
}: SidebarProps) {
  return (
    <div className="w-60 bg-sidebar h-screen flex flex-col border-r border-sidebar-border">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">Spotify</h1>
      </div>

      <nav className="px-4 space-y-1">
        <Button
          variant="ghost"
          className={`w-full justify-start gap-4 ${activePage === 'home' ? 'bg-sidebar-accent' : ''}`}
          onClick={() => onNavigate('home')}
          data-testid="nav-home"
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Button>
        <Button
          variant="ghost"
          className={`w-full justify-start gap-4 ${activePage === 'search' ? 'bg-sidebar-accent' : ''}`}
          onClick={() => onNavigate('search')}
          data-testid="nav-search"
        >
          <Search className="w-5 h-5" />
          <span>Search</span>
        </Button>
        <Button
          variant="ghost"
          className={`w-full justify-start gap-4 ${activePage === 'library' ? 'bg-sidebar-accent' : ''}`}
          onClick={() => onNavigate('library')}
          data-testid="nav-library"
        >
          <Library className="w-5 h-5" />
          <span>Your Library</span>
        </Button>
      </nav>

      <div className="mt-6 px-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-4"
          onClick={onCreatePlaylist}
          data-testid="button-create-playlist"
        >
          <Plus className="w-5 h-5" />
          <span>Create Playlist</span>
        </Button>
      </div>

      <div className="flex-1 px-4 mt-4">
        <ScrollArea className="h-full">
          <div className="space-y-1 pb-4">
            {userPlaylists.map((playlist) => (
              <Button
                key={playlist.id}
                variant="ghost"
                className="w-full justify-start text-sm text-muted-foreground hover:text-foreground"
                onClick={() => onPlaylistClick?.(playlist.id)}
                data-testid={`playlist-${playlist.id}`}
              >
                {playlist.name}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
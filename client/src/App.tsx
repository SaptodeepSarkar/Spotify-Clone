// App.tsx - UPDATED
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery, useMutation } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PlayerProvider, usePlayer } from "@/contexts/PlayerContext";
import Sidebar from "@/components/Sidebar";
import PlayerBar from "@/components/PlayerBar";
import AuthModal from "@/components/AuthModal";
import SongCard from "@/components/SongCard";
import SongTable from "@/components/SongTable";
import AddSongModal from "@/components/AddSongModal";
import UserManagementTable from "@/components/UserManagementTable";
import SuspendUserModal from "@/components/SuspendUserModal";
import PlaylistDetail from "@/components/PlaylistDetail";
import EnhancedCreatePlaylist from "@/components/EnhancedCreatePlaylist";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus, Users, Music } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import type { Song, Playlist, User } from "@shared/schema";

function MainApp() {
  const { user, login, register, logout, isLoading: authLoading } = useAuth();
  const {
    currentSong,
    isPlaying,
    currentTime,
    volume,
    shuffle,
    repeat,
    playSong,
    playPause,
    next,
    previous,
    seek,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    setQueue,
  } = usePlayer();
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activePage, setActivePage] = useState("home");
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingSongId, setEditingSongId] = useState<string | null>(null);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const { toast } = useToast();

  // Show login modal if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setShowLoginModal(true);
    }
  }, [authLoading, user]);

  // Fetch songs
  const { data: songs = [], refetch: refetchSongs } = useQuery<Song[]>({
    queryKey: ["/api/songs"],
    enabled: !!user,
  });

  // Fetch playlists
  const { data: playlists = [], refetch: refetchPlaylists } = useQuery<Playlist[]>({
    queryKey: ["/api/playlists"],
    enabled: !!user,
  });

  // Fetch users (admin only)
  const { data: users = [], refetch: refetchUsers } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: user?.role === "admin",
  });

  // Get selected playlist data
  const selectedPlaylist = selectedPlaylistId 
    ? playlists.find(p => p.id === selectedPlaylistId)
    : null;

  // Delete song mutation
  const deleteSongMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/songs/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete song");
      return response.json();
    },
    onSuccess: () => {
      refetchSongs();
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
      toast({ title: "Song deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete song", variant: "destructive" });
    },
  });

  // Suspend user mutation
  const suspendUserMutation = useMutation({
    mutationFn: async ({ userId, days, reason }: { userId: string; days: number; reason: string }) => {
      const response = await fetch(`/api/users/${userId}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days, reason }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to suspend user");
      return response.json();
    },
    onSuccess: () => {
      refetchUsers();
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "User suspended successfully" });
      setShowSuspendModal(false);
    },
    onError: () => {
      toast({ title: "Failed to suspend user", variant: "destructive" });
    },
  });

  // Unsuspend user mutation
  const unsuspendUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/users/${userId}/unsuspend`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to unsuspend user");
      return response.json();
    },
    onSuccess: () => {
      refetchUsers();
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "User unsuspended successfully" });
    },
    onError: () => {
      toast({ title: "Failed to unsuspend user", variant: "destructive" });
    },
  });

  // Enhanced create playlist mutation
  const createPlaylistMutation = useMutation({
    mutationFn: async (playlistData: { name: string; description?: string; coverFile?: File }) => {
      const formData = new FormData();
      formData.append("name", playlistData.name);
      
      if (playlistData.description) {
        formData.append("description", playlistData.description);
      }
      
      if (playlistData.coverFile) {
        formData.append("cover", playlistData.coverFile);
      }
      
      formData.append("songIds", JSON.stringify([]));
    
      const response = await fetch("/api/playlists", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create playlist");
      }
      
      return response.json();
    },
    onSuccess: () => {
      refetchPlaylists();
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
      setShowCreatePlaylistModal(false);
      toast({ title: "Playlist created successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create playlist", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleLogin = async (username: string, password: string) => {
    try {
      await login(username, password);
      setShowLoginModal(false);
      toast({ title: `Welcome back, ${username}!` });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowLoginModal(true);
    toast({ title: "Logged out successfully" });
  };

  const handleCreatePlaylist = () => {
    setShowCreatePlaylistModal(true);
  };

  const handleEnhancedCreatePlaylist = (playlistData: { name: string; description?: string; coverFile?: File }) => {
    createPlaylistMutation.mutate(playlistData);
  };

  const handlePlaylistClick = (playlistId: string) => {
    setSelectedPlaylistId(playlistId);
    setActivePage("playlist-detail");
  };

  const handleBackFromPlaylist = () => {
    setSelectedPlaylistId(null);
    setActivePage("library");
  };

  const handlePlaySong = (songId: string) => {
    const song = songs.find((s: any) => s.id === songId);
    if (song) {
      playSong(song);
      setQueue(songs);
    }
  };

  const handlePlaySongInPlaylist = (songId: string) => {
    const song = songs.find((s: any) => s.id === songId);
    if (song && selectedPlaylist) {
      const playlistSongs = songs.filter(s => selectedPlaylist.songIds?.includes(s.id));
      setQueue(playlistSongs);
      playSong(song);
    }
  };

  const handleSuspendUser = (userId: string) => {
    setSelectedUserId(userId);
    setShowSuspendModal(true);
  };

  const handleAddSong = async (songData: any) => {
    try {
      const formData = new FormData();
      formData.append("title", songData.title);
      formData.append("artist", songData.artist);
      formData.append("album", songData.album);
      formData.append("duration", songData.duration.toString());
      formData.append("audioUrl", songData.audioUrl);
      if (songData.coverFile) {
        formData.append("cover", songData.coverFile);
      }

      const url = editingSongId ? `/api/songs/${editingSongId}` : "/api/songs";
      const method = editingSongId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        body: formData,
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to save song");

      refetchSongs();
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
      setShowAddSongModal(false);
      setEditingSongId(null);
      toast({ title: editingSongId ? "Song updated successfully" : "Song added successfully" });
    } catch (error) {
      toast({ title: "Failed to save song", variant: "destructive" });
    }
  };

  const filteredSongs = songs.filter((song) =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.album.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRegister = async (username: string, password: string) => {
    try {
      await register(username, password);
      setShowLoginModal(false);
      toast({ title: `Welcome to Spotify, ${username}!` });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Unable to create account",
        variant: "destructive",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="flex items-center justify-center h-screen bg-background">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 text-primary">Spotify</h1>
            <p className="text-muted-foreground mb-4">Please log in to continue</p>
          </div>
        </div>
        <AuthModal
          open={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        userPlaylists={playlists}
        onCreatePlaylist={handleCreatePlaylist}
        onPlaylistClick={handlePlaylistClick}
      />

      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-8">
            {activePage === "home" && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h1 className="text-4xl font-bold">Good evening</h1>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      Logged in as <span className="font-medium text-foreground">{user.username}</span>
                    </span>
                    {user.role === "admin" && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setActivePage("admin")}
                        data-testid="button-admin-panel"
                      >
                        Admin Panel
                      </Button>
                    )}
                    <Button variant="secondary" size="sm" onClick={handleLogout} data-testid="button-logout">
                      Logout
                    </Button>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">Recently Played</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {songs.slice(0, 5).map((song) => (
                      <SongCard
                        key={song.id}
                        title={song.title}
                        artist={song.artist}
                        coverUrl={song.coverUrl || undefined}
                        onPlay={() => handlePlaySong(song.id)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">All Songs</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {songs.map((song) => (
                      <SongCard
                        key={song.id}
                        title={song.title}
                        artist={song.artist}
                        coverUrl={song.coverUrl || undefined}
                        onPlay={() => handlePlaySong(song.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activePage === "search" && (
              <div className="space-y-6">
                <h1 className="text-4xl font-bold">Search</h1>
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="What do you want to listen to?"
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-search"
                  />
                </div>
                {searchQuery && filteredSongs.length > 0 ? (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Results</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {filteredSongs.map((song) => (
                        <SongCard
                          key={song.id}
                          title={song.title}
                          artist={song.artist}
                          coverUrl={song.coverUrl || undefined}
                          onPlay={() => handlePlaySong(song.id)}
                        />
                      ))}
                    </div>
                  </div>
                ) : searchQuery ? (
                  <p className="text-muted-foreground">No results found</p>
                ) : (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Browse All</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {["Pop", "Rock", "Hip-Hop", "Electronic", "Jazz", "Classical"].map((genre) => (
                        <Card key={genre} className="p-6 hover-elevate active-elevate-2 cursor-pointer">
                          <h3 className="text-xl font-bold">{genre}</h3>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activePage === "library" && (
              <div className="space-y-6">
                <h1 className="text-4xl font-bold">Your Library</h1>
                <Tabs defaultValue="songs" className="w-full">
                  <TabsList>
                    <TabsTrigger value="songs" data-testid="tab-songs">
                      Songs
                    </TabsTrigger>
                    <TabsTrigger value="playlists" data-testid="tab-playlists">
                      Playlists
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="songs" className="mt-6">
                    <SongTable songs={songs} onPlay={handlePlaySong} isAdmin={false} />
                  </TabsContent>
                  <TabsContent value="playlists" className="mt-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {playlists.map((playlist) => (
                        <Card
                          key={playlist.id}
                          className="p-4 hover-elevate active-elevate-2 cursor-pointer"
                          onClick={() => handlePlaylistClick(playlist.id)}
                        >
                          <div className="aspect-square bg-muted rounded-md mb-4 flex items-center justify-center overflow-hidden">
                            {playlist.coverUrl ? (
                              <img 
                                src={playlist.coverUrl} 
                                alt={playlist.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Music className="w-12 h-12 text-muted-foreground" />
                            )}
                          </div>
                          <h3 className="font-semibold truncate">{playlist.name}</h3>
                          {playlist.description && (
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {playlist.description}
                            </p>
                          )}
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {activePage === "playlist-detail" && selectedPlaylist && (
              <PlaylistDetail
                playlist={selectedPlaylist}
                songs={songs}
                onBack={handleBackFromPlaylist}
              />
            )}

            {activePage === "admin" && user.role === "admin" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-4xl font-bold">Admin Panel</h1>
                  <Button onClick={() => setActivePage("home")} variant="secondary" data-testid="button-back-home">
                    Back to Home
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Songs</CardTitle>
                      <Music className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold" data-testid="stat-total-songs">
                        {songs.length}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold" data-testid="stat-total-users">
                        {users.length}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                      <Users className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold" data-testid="stat-active-users">
                        {users.filter((u) => !u.suspended).length}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Suspended</CardTitle>
                      <Users className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold" data-testid="stat-suspended-users">
                        {users.filter((u) => u.suspended).length}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Tabs defaultValue="songs" className="w-full">
                  <TabsList>
                    <TabsTrigger value="songs" data-testid="tab-admin-songs">
                      Song Management
                    </TabsTrigger>
                    <TabsTrigger value="users" data-testid="tab-admin-users">
                      User Management
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="songs" className="mt-6 space-y-4">
                    <div className="flex justify-end">
                      <Button
                        onClick={() => {
                          setEditingSongId(null);
                          setShowAddSongModal(true);
                        }}
                        data-testid="button-add-song"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Song
                      </Button>
                    </div>
                    <SongTable
                      songs={songs}
                      onPlay={handlePlaySong}
                      onEdit={(id) => {
                        setEditingSongId(id);
                        setShowAddSongModal(true);
                      }}
                      onDelete={(id) => deleteSongMutation.mutate(id)}
                      isAdmin={true}
                    />
                  </TabsContent>

                  <TabsContent value="users" className="mt-6">
                    <UserManagementTable
                      users={users}
                      onSuspend={handleSuspendUser}
                      onUnsuspend={(id) => unsuspendUserMutation.mutate(id)}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </ScrollArea>

        <PlayerBar
          currentSong={
            currentSong
              ? {
                  title: currentSong.title,
                  artist: currentSong.artist,
                  coverUrl: currentSong.coverUrl,
                }
              : undefined
          }
          isPlaying={isPlaying}
          onPlayPause={playPause}
          onNext={next}
          onPrevious={previous}
          onShuffle={toggleShuffle}
          onRepeat={toggleRepeat}
          shuffle={shuffle}
          repeat={repeat}
          currentTime={currentTime}
          duration={currentSong?.duration || 0}
          onSeek={seek}
          volume={volume}
          onVolumeChange={setVolume}
        />
      </div>

      <AddSongModal
        open={showAddSongModal}
        onClose={() => {
          setShowAddSongModal(false);
          setEditingSongId(null);
        }}
        onSubmit={handleAddSong}
        editMode={!!editingSongId}
        initialData={
          editingSongId
            ? songs.find((s) => s.id === editingSongId)
            : undefined
        }
      />

      <EnhancedCreatePlaylist
        open={showCreatePlaylistModal}
        onClose={() => setShowCreatePlaylistModal(false)}
        onSubmit={handleEnhancedCreatePlaylist}
      />

      <SuspendUserModal
        open={showSuspendModal}
        username={users.find((u) => u.id === selectedUserId)?.username || ""}
        onClose={() => setShowSuspendModal(false)}
        onSubmit={(data) => {
          if (selectedUserId) {
            suspendUserMutation.mutate({
              userId: selectedUserId,
              days: data.days,
              reason: data.reason,
            });
          }
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <PlayerProvider>
            <MainApp />
            <Toaster />
          </PlayerProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
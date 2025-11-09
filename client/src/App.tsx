import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import PlayerBar from "@/components/PlayerBar";
import LoginModal from "@/components/LoginModal";
import SongCard from "@/components/SongCard";
import SongTable from "@/components/SongTable";
import AddSongModal from "@/components/AddSongModal";
import UserManagementTable from "@/components/UserManagementTable";
import SuspendUserModal from "@/components/SuspendUserModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus, Users, Music } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

function App() {
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string } | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(true);
  const [activePage, setActivePage] = useState('home');
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(70);
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const mockSongs = [
    { id: '1', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: 200 },
    { id: '2', title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', duration: 203 },
    { id: '3', title: 'Save Your Tears', artist: 'The Weeknd', album: 'After Hours', duration: 215 },
    { id: '4', title: 'Peaches', artist: 'Justin Bieber', album: 'Justice', duration: 198 },
    { id: '5', title: 'Good 4 U', artist: 'Olivia Rodrigo', album: 'SOUR', duration: 178 },
    { id: '6', title: 'Stay', artist: 'The Kid LAROI', album: 'F*ck Love 3', duration: 141 },
  ];

  const mockUsers = [
    { id: '1', username: 'admin', role: 'admin', suspended: false },
    { id: '2', username: 'john_doe', role: 'user', suspended: false },
    { id: '3', username: 'jane_smith', role: 'user', suspended: true, suspendedUntil: '2024-12-31' },
    { id: '4', username: 'bob_wilson', role: 'user', suspended: false },
  ];

  const mockPlaylists = [
    { id: '1', name: 'My Playlist #1' },
    { id: '2', name: 'Chill Vibes' },
    { id: '3', name: 'Workout Mix' },
  ];

  const [currentSong] = useState(mockSongs[0]);

  const handleLogin = (username: string, password: string) => {
    console.log('Login:', username, password);
    const isAdmin = username === 'admin';
    setCurrentUser({ username, role: isAdmin ? 'admin' : 'user' });
    setShowLoginModal(false);
  };

  const handleSuspendUser = (userId: string) => {
    setSelectedUserId(userId);
    setShowSuspendModal(true);
  };

  const filteredSongs = mockSongs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.album.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex h-screen bg-background">
          <Sidebar
            activePage={activePage}
            onNavigate={setActivePage}
            userPlaylists={mockPlaylists}
            onCreatePlaylist={() => console.log('Create playlist')}
          />

          <div className="flex-1 flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-8">
                {activePage === 'home' && (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <h1 className="text-4xl font-bold">Good evening</h1>
                      {currentUser && (
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            Logged in as <span className="font-medium text-foreground">{currentUser.username}</span>
                          </span>
                          {currentUser.role === 'admin' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setActivePage('admin')}
                              data-testid="button-admin-panel"
                            >
                              Admin Panel
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4">Recently Played</h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {mockSongs.slice(0, 5).map((song) => (
                          <SongCard
                            key={song.id}
                            title={song.title}
                            artist={song.artist}
                            onPlay={() => console.log('Play:', song.id)}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4">Your Top Mixes</h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {mockSongs.slice(0, 5).map((song) => (
                          <SongCard
                            key={song.id}
                            title={song.title}
                            artist={song.artist}
                            onPlay={() => console.log('Play:', song.id)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activePage === 'search' && (
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
                    {searchQuery ? (
                      <div>
                        <h2 className="text-2xl font-bold mb-4">Results</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                          {filteredSongs.map((song) => (
                            <SongCard
                              key={song.id}
                              title={song.title}
                              artist={song.artist}
                              onPlay={() => console.log('Play:', song.id)}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h2 className="text-2xl font-bold mb-4">Browse All</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Jazz', 'Classical'].map((genre) => (
                            <Card key={genre} className="p-6 hover-elevate active-elevate-2 cursor-pointer">
                              <h3 className="text-xl font-bold">{genre}</h3>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activePage === 'library' && (
                  <div className="space-y-6">
                    <h1 className="text-4xl font-bold">Your Library</h1>
                    <Tabs defaultValue="songs" className="w-full">
                      <TabsList>
                        <TabsTrigger value="songs" data-testid="tab-songs">Songs</TabsTrigger>
                        <TabsTrigger value="playlists" data-testid="tab-playlists">Playlists</TabsTrigger>
                      </TabsList>
                      <TabsContent value="songs" className="mt-6">
                        <SongTable
                          songs={mockSongs}
                          onPlay={(id) => console.log('Play:', id)}
                          isAdmin={false}
                        />
                      </TabsContent>
                      <TabsContent value="playlists" className="mt-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                          {mockPlaylists.map((playlist) => (
                            <Card key={playlist.id} className="p-4 hover-elevate active-elevate-2 cursor-pointer">
                              <div className="aspect-square bg-muted rounded-md mb-4 flex items-center justify-center">
                                <Music className="w-12 h-12 text-muted-foreground" />
                              </div>
                              <h3 className="font-semibold">{playlist.name}</h3>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}

                {activePage === 'admin' && currentUser?.role === 'admin' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h1 className="text-4xl font-bold">Admin Panel</h1>
                      <Button onClick={() => setActivePage('home')} variant="secondary" data-testid="button-back-home">
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
                          <div className="text-2xl font-bold" data-testid="stat-total-songs">{mockSongs.length}</div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                          <Users className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold" data-testid="stat-total-users">{mockUsers.length}</div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                          <Users className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold" data-testid="stat-active-users">
                            {mockUsers.filter(u => !u.suspended).length}
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
                            {mockUsers.filter(u => u.suspended).length}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Tabs defaultValue="songs" className="w-full">
                      <TabsList>
                        <TabsTrigger value="songs" data-testid="tab-admin-songs">Song Management</TabsTrigger>
                        <TabsTrigger value="users" data-testid="tab-admin-users">User Management</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="songs" className="mt-6 space-y-4">
                        <div className="flex justify-end">
                          <Button onClick={() => setShowAddSongModal(true)} data-testid="button-add-song">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Song
                          </Button>
                        </div>
                        <SongTable
                          songs={mockSongs}
                          onPlay={(id) => console.log('Play:', id)}
                          onEdit={(id) => console.log('Edit:', id)}
                          onDelete={(id) => console.log('Delete:', id)}
                          isAdmin={true}
                        />
                      </TabsContent>

                      <TabsContent value="users" className="mt-6">
                        <UserManagementTable
                          users={mockUsers}
                          onSuspend={handleSuspendUser}
                          onUnsuspend={(id) => console.log('Unsuspend:', id)}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </div>
            </ScrollArea>

            <PlayerBar
              currentSong={currentSong}
              isPlaying={isPlaying}
              onPlayPause={() => setIsPlaying(!isPlaying)}
              onNext={() => console.log('Next')}
              onPrevious={() => console.log('Previous')}
              onShuffle={() => setShuffle(!shuffle)}
              onRepeat={() => setRepeat(!repeat)}
              shuffle={shuffle}
              repeat={repeat}
              currentTime={currentTime}
              duration={currentSong.duration}
              onSeek={setCurrentTime}
              volume={volume}
              onVolumeChange={setVolume}
            />
          </div>
        </div>

        <LoginModal
          open={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
        />

        <AddSongModal
          open={showAddSongModal}
          onClose={() => setShowAddSongModal(false)}
          onSubmit={(data) => {
            console.log('Add song:', data);
            setShowAddSongModal(false);
          }}
        />

        <SuspendUserModal
          open={showSuspendModal}
          username={mockUsers.find(u => u.id === selectedUserId)?.username || ''}
          onClose={() => setShowSuspendModal(false)}
          onSubmit={(data) => {
            console.log('Suspend:', selectedUserId, data);
            setShowSuspendModal(false);
          }}
        />

        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

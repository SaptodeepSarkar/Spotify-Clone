import Sidebar from '../Sidebar';
import { useState } from 'react';

export default function SidebarExample() {
  const [activePage, setActivePage] = useState('home');
  
  const mockPlaylists = [
    { id: '1', name: 'My Playlist #1' },
    { id: '2', name: 'Chill Vibes' },
    { id: '3', name: 'Workout Mix' },
    { id: '4', name: 'Road Trip' },
  ];

  return (
    <Sidebar
      activePage={activePage}
      onNavigate={(page) => {
        console.log('Navigate to:', page);
        setActivePage(page);
      }}
      userPlaylists={mockPlaylists}
      onCreatePlaylist={() => console.log('Create playlist')}
    />
  );
}

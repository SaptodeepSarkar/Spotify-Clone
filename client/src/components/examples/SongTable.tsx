import SongTable from '../SongTable';

export default function SongTableExample() {
  const mockSongs = [
    { id: '1', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: 200 },
    { id: '2', title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', duration: 203 },
    { id: '3', title: 'Save Your Tears', artist: 'The Weeknd', album: 'After Hours', duration: 215 },
    { id: '4', title: 'Peaches', artist: 'Justin Bieber', album: 'Justice', duration: 198 },
  ];

  return (
    <div className="p-8">
      <SongTable
        songs={mockSongs}
        onPlay={(id) => console.log('Play song:', id)}
        onEdit={(id) => console.log('Edit song:', id)}
        onDelete={(id) => console.log('Delete song:', id)}
        isAdmin={true}
      />
    </div>
  );
}

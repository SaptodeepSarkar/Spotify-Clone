import SongCard from '../SongCard';

export default function SongCardExample() {
  return (
    <div className="p-8 grid grid-cols-4 gap-4">
      <SongCard
        title="Shape of You"
        artist="Ed Sheeran"
        onPlay={() => console.log('Playing: Shape of You')}
      />
      <SongCard
        title="Starboy"
        artist="The Weeknd"
        onPlay={() => console.log('Playing: Starboy')}
      />
      <SongCard
        title="Levitating"
        artist="Dua Lipa"
        onPlay={() => console.log('Playing: Levitating')}
      />
      <SongCard
        title="Save Your Tears"
        artist="The Weeknd"
        onPlay={() => console.log('Playing: Save Your Tears')}
      />
    </div>
  );
}

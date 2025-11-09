import PlayerBar from '../PlayerBar';
import { useState } from 'react';

export default function PlayerBarExample() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [currentTime, setCurrentTime] = useState(45);
  const [volume, setVolume] = useState(70);

  return (
    <PlayerBar
      currentSong={{
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        coverUrl: undefined,
      }}
      isPlaying={isPlaying}
      onPlayPause={() => {
        console.log('Play/Pause');
        setIsPlaying(!isPlaying);
      }}
      onNext={() => console.log('Next track')}
      onPrevious={() => console.log('Previous track')}
      onShuffle={() => {
        console.log('Shuffle toggled');
        setShuffle(!shuffle);
      }}
      onRepeat={() => {
        console.log('Repeat toggled');
        setRepeat(!repeat);
      }}
      shuffle={shuffle}
      repeat={repeat}
      currentTime={currentTime}
      duration={213}
      onSeek={(time) => {
        console.log('Seek to:', time);
        setCurrentTime(time);
      }}
      volume={volume}
      onVolumeChange={(vol) => {
        console.log('Volume:', vol);
        setVolume(vol);
      }}
    />
  );
}

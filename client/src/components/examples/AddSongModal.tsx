import AddSongModal from '../AddSongModal';
import { useState } from 'react';

export default function AddSongModalExample() {
  const [open, setOpen] = useState(true);

  return (
    <AddSongModal
      open={open}
      onClose={() => {
        console.log('Modal closed');
        setOpen(false);
      }}
      onSubmit={(data) => {
        console.log('Song data:', data);
        setOpen(false);
      }}
    />
  );
}

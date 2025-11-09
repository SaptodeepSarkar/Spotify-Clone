import SuspendUserModal from '../SuspendUserModal';
import { useState } from 'react';

export default function SuspendUserModalExample() {
  const [open, setOpen] = useState(true);

  return (
    <SuspendUserModal
      open={open}
      username="john_doe"
      onClose={() => {
        console.log('Modal closed');
        setOpen(false);
      }}
      onSubmit={(data) => {
        console.log('Suspend data:', data);
        setOpen(false);
      }}
    />
  );
}

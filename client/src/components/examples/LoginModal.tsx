import LoginModal from '../LoginModal';
import { useState } from 'react';

export default function LoginModalExample() {
  const [open, setOpen] = useState(true);

  return (
    <LoginModal
      open={open}
      onClose={() => {
        console.log('Modal closed');
        setOpen(false);
      }}
      onLogin={(username, password) => {
        console.log('Login:', username, password);
        setOpen(false);
      }}
    />
  );
}

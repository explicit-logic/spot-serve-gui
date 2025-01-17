import { Toaster } from '@/components/ui/toaster';
import { Outlet } from 'react-router';

import './app.css';

function App() {
  return (
    <>
      <Toaster />
      <Outlet />
    </>
  );
}

export default App;

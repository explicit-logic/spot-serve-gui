import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { ConnectionProvider } from '@/providers/connection-provider';
import { Outlet } from 'react-router';

import './app.css';

function App() {
  return (
    <>
      <Toaster />
      <ConnectionProvider>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <Outlet />
        </ThemeProvider>
      </ConnectionProvider>
    </>
  );
}

export default App;

import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { ConnectionProvider } from '@/providers/connection-provider';
import NiceModal from '@ebay/nice-modal-react';
import { Outlet } from 'react-router';

import './styles.css';

function App() {
  return (
    <>
      <Toaster />
      <NiceModal.Provider>
        <ConnectionProvider>
          <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <Outlet />
          </ThemeProvider>
        </ConnectionProvider>
      </NiceModal.Provider>
    </>
  );
}

export default App;

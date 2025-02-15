import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import Updater from '@/components/updater';
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
            <Updater />
            <Outlet />
          </ThemeProvider>
        </ConnectionProvider>
      </NiceModal.Provider>
    </>
  );
}

export default App;

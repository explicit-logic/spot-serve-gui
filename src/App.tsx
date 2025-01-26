import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { Outlet } from 'react-router';

import './app.css';

function App() {
  return (
    <>
      <Toaster />
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <Outlet />
      </ThemeProvider>
    </>
  );
}

export default App;

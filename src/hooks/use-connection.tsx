// Modules
import { useContext } from 'react';

// Context
import { ConnectionContext } from '@/providers/connection-provider';

export function useConnection() {
  const connectionContext = useContext(ConnectionContext);

  return connectionContext;
}

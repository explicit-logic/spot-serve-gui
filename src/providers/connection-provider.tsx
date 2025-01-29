import type { DataConnection } from 'peerjs';

import type React from 'react';
import { createContext, useCallback, useMemo, useState } from 'react';

// Constants
import { STATES, type StateType } from '@/constants/connection';

// Hooks
import { useServerListener } from '@/hooks/use-server-listener';

type ConnectionContextType = {
  activeCount: number;
  loading: boolean;
  online: boolean;
  state: StateType;
};

const initialValues: ConnectionContextType = Object.freeze({
  activeCount: 0,
  loading: false,
  online: false,
  state: STATES.OFFLINE,
});

export const ConnectionContext =
  createContext<ConnectionContextType>(initialValues);

export function ConnectionProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [activeCount, setActiveCount] = useState<number>(0);
  const [state, setState] = useState<StateType>(STATES.OFFLINE);

  const onLoading = useCallback(() => {
    setState(STATES.LOADING);
  }, []);

  const onOpen = useCallback(() => {
    setState(STATES.ONLINE);
  }, []);

  const onClose = useCallback(() => {
    setState(STATES.OFFLINE);
  }, []);

  const onConnection = useCallback((connections: DataConnection[]) => {
    setActiveCount(connections.length);
  }, []);

  const onError = useCallback(() => {
    setState(STATES.ERROR);
  }, []);

  useServerListener({ onClose, onConnection, onError, onLoading, onOpen });

  const value = useMemo(
    () => ({
      activeCount,
      loading: state === STATES.LOADING,
      online: state === STATES.ONLINE,
      state,
    }),
    [activeCount, state],
  );

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
}

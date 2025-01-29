import type { DataConnection } from 'peerjs';

import { eventEmitter } from '@/lib/eventEmitter';
import { useEffect } from 'react';

import { SERVER_EVENTS } from '@/constants/connection';

type Props = {
  onClose: () => void;
  onConnection: (connections: DataConnection[]) => void;
  onError: () => void;
  onLoading: () => void;
  onOpen: () => void;
};

export function useServerListener({
  onClose,
  onConnection,
  onError,
  onLoading,
  onOpen,
}: Props) {
  useEffect(() => {
    const handlers = {
      [SERVER_EVENTS.CONNECTION]: onConnection,
      [SERVER_EVENTS.LOADING]: onLoading,
      [SERVER_EVENTS.OPEN]: onOpen,
      [SERVER_EVENTS.CLOSE]: onClose,
      [SERVER_EVENTS.ERROR]: onError,
    };

    for (const [eventName, handler] of Object.entries(handlers)) {
      eventEmitter.on(eventName, handler);
    }

    return () => {
      for (const [eventName, handler] of Object.entries(handlers)) {
        eventEmitter.off(eventName, handler);
      }
    };
  }, [onConnection, onClose, onError, onLoading, onOpen]);
}

import type { DataConnection } from 'peerjs';

// Constants
import { CONNECTION_EVENTS } from '@/constants/connection';

// Lib
import { eventEmitter } from '@/lib/eventEmitter';

type Handler = (connection: DataConnection, message: Message) => void;

export function listenMessage(method: string, handler: Handler) {
  eventEmitter.on(
    CONNECTION_EVENTS.MESSAGE,
    (connection: DataConnection, message: Message) => {
      if (message?.method === method) {
        handler(connection, message);
      }
    },
  );

  return () => eventEmitter.off(CONNECTION_EVENTS.MESSAGE);
}

import type { DataConnection } from 'peerjs';

// Lib
import { eventEmitter } from '@/lib/eventEmitter';

// Constants
import { CONNECTION_EVENTS, SERVER_EVENTS } from '@/constants/connection';

// Store
import { attachConnection, deleteConnection, getConnections } from './store';

export function addConnection(connection: DataConnection) {
  attachConnection(connection);
  console.log('new peer', connection.peer);

  emitConnection();

  const detach = () => {
    deleteConnection(connection.peer);
    emitConnection();
  };

  connection
    .on('close', () => {
      detach();
      eventEmitter.emit(CONNECTION_EVENTS.CLOSE, connection);
      emitConnection();
    })
    .on('error', (error) => {
      detach();
      eventEmitter.emit(CONNECTION_EVENTS.ERROR, connection, error);
      emitConnection();
    })
    .on('data', async (body) => {
      console.log('data', body);
      eventEmitter.emit(CONNECTION_EVENTS.MESSAGE, connection, body);
    });
}

function emitConnection() {
  eventEmitter.emit(SERVER_EVENTS.CONNECTION, getConnections());
}

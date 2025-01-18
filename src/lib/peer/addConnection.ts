import type { DataConnection } from 'peerjs';

// Lib
import { eventEmitter } from '@/lib/eventEmitter';

// Constants
import { CONNECTION_EVENTS } from '@/constants/connection';

// Store
import { attachConnection, deleteConnection } from './store';

export function addConnection(connection: DataConnection) {
  attachConnection(connection);
  console.log('new peer', connection.peer);

  const reset = () => {
    deleteConnection(connection.peer);
  };

  connection
    .on('close', () => {
      reset();
      eventEmitter.emit(CONNECTION_EVENTS.CLOSE, connection);
    })
    .on('error', (error) => {
      reset();
      eventEmitter.emit(CONNECTION_EVENTS.ERROR, connection, error);
    })
    .on('data', async (body) => {
      console.log('data', body);
      eventEmitter.emit(CONNECTION_EVENTS.MESSAGE, connection, body);
    });
}

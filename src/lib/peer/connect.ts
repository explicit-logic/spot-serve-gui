import Peer, { type DataConnection } from 'peerjs';

// Helpers
import { detectPlatform } from '@/helpers/detectPlatform';
import { promiseWithTimeout } from '@/helpers/promiseWithTimeout';

// Constants
import { CLIENT_EVENTS, SERVER_EVENTS, STATES } from '@/constants/connection';
import { TYPES } from '@/constants/message';

// Lib
import { eventEmitter } from '@/lib/eventEmitter';

// Store
import {
  attachConnection,
  clear,
  deleteConnection,
  // detachConnection,
  getClientIdByConnection,
  getConnectionByClientId,
  getServer,
  hasConnection,
  setConnection,
  setServer,
  updateClientState,
} from './store';

const TIMEOUT = 60_000;

export async function connect() {
  const cachedServer = getServer();
  if (cachedServer) return cachedServer;

  eventEmitter.emit(SERVER_EVENTS.LOADING);

  const peer = new Peer();
  setServer(peer);

  const close = () => {
    resetAll();
    eventEmitter.emit(SERVER_EVENTS.CLOSE);
  };
  const errorHandler = (error: Error) => {
    resetAll();
    eventEmitter.emit(SERVER_EVENTS.ERROR, error);
    console.error(error);
  };
  peer
    .on('close', close)
    .on('disconnected', close)
    .on('error', errorHandler)

    .on('connection', (connection) =>
      establishConnection({ connection, server: peer }),
    );

  const serverId = await promiseWithTimeout<string>(TIMEOUT, (resolve) =>
    peer.on('open', (id) => resolve(id)),
  );

  eventEmitter.emit(SERVER_EVENTS.OPEN);

  console.log('Server ID: ', serverId);

  return peer;
}

function resetAll() {
  clear();
  setServer(undefined);
  eventEmitter.emit(SERVER_EVENTS.CONNECTION, {});
}

async function establishConnection(params: {
  connection: DataConnection;
  server: Peer;
}) {
  const { connection } = params;
  const language = 'en';

  setConnection(connection);

  const reset = () => {
    // detachConnection(connection);
    deleteConnection(connection.peer);
  };

  connection
    .on('close', () => {
      const clientId = getClientIdByConnection(connection);
      reset();
      if (clientId) {
        eventEmitter.emit(
          SERVER_EVENTS.CONNECTION,
          updateClientState(clientId, STATES.OFFLINE),
        );
        eventEmitter.emit(CLIENT_EVENTS.CLOSE, clientId);
      }
    })
    .on('error', (error) => {
      const clientId = getClientIdByConnection(connection);
      reset();
      if (clientId) {
        eventEmitter.emit(
          SERVER_EVENTS.CONNECTION,
          updateClientState(clientId, STATES.ERROR),
        );
        eventEmitter.emit(CLIENT_EVENTS.ERROR, clientId, error);
      }
    })
    .on('data', async (body) => {
      const message = body as Message;

      console.log('message', body);

      if (message.type === TYPES.connect) {
        const { data } = message;
        const clientId = ensureClientId(connection, message);

        if (data.clientId) {
          const prevConnection = getConnectionByClientId(data.clientId);
          if (prevConnection && prevConnection.peer !== connection.peer) {
            // prevConnection.close();
            deleteConnection(prevConnection.peer);
          }
        }
        attachConnection(clientId, connection.peer);
        await connection.send(getInit({ clientId, language }) as Messages.Init);

        eventEmitter.emit(
          SERVER_EVENTS.CONNECTION,
          updateClientState(clientId, STATES.ONLINE),
        );
        eventEmitter.emit(CLIENT_EVENTS.MESSAGE, clientId, message);

        return;
      }

      if (!('clientId' in message)) {
        return;
      }
      const connectionClientId = getClientIdByConnection(connection);
      if (!connectionClientId || connectionClientId !== message.clientId) {
        return;
      }

      eventEmitter.emit(CLIENT_EVENTS.MESSAGE, connectionClientId, message);
    });
}

function ensureClientId(
  connection: DataConnection,
  message: Messages.Connect,
): string {
  const { data } = message;
  if (data.clientId && hasConnection(data.clientId)) {
    return data.clientId;
  }

  return connection.peer;
}

/*
  Exception listeners

  Server: close, disconnected, error

  Client: close, error
*/

export function getInit({
  clientId,
  language,
}: { clientId: Client['id']; language: string }): Messages.Init {
  return {
    type: TYPES.init,
    data: {
      userAgent: navigator.userAgent,
      clientId,
      language,
      platform: detectPlatform(),
      theme: 'dark',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };
}

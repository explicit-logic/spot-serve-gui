import Peer from 'peerjs';

// Helpers
import { promiseWithTimeout } from '@/helpers/promiseWithTimeout';

// Constants
import { SERVER_EVENTS } from '@/constants/connection';

// Lib
import { eventEmitter } from '@/lib/eventEmitter';

// Store
import { clear, getServer, setServer } from './store';

import { addConnection } from './add-connection';

const TIMEOUT = 60_000;

export async function connect() {
  const cachedServer = getServer();
  if (cachedServer) {
    if (!cachedServer.id) {
      while (!cachedServer.id) {}
      return cachedServer;
    }

    return cachedServer;
  }

  eventEmitter.emit(SERVER_EVENTS.LOADING);

  const peer = new Peer();
  setServer(peer);

  const close = () => {
    resetAll();
    eventEmitter.emit(SERVER_EVENTS.CLOSE);
    console.log('Disconnected');
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
    .on('connection', addConnection);

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
  eventEmitter.emit(SERVER_EVENTS.CONNECTION, []);
}

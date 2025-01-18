import type { DataConnection, Peer } from 'peerjs';

const connectionMap = new Map<DataConnection['peer'], DataConnection>();

let _server: Peer | undefined;

export function clear() {
  connectionMap.clear();
}

export function deleteConnection(connectionId: DataConnection['peer']) {
  connectionMap.delete(connectionId);
}

export function getConnections() {
  return connectionMap.values();
}

export function getServer() {
  return _server;
}

export function attachConnection(connection: DataConnection) {
  connectionMap.set(connection.peer, connection);
}

export function setServer(server: Peer | undefined) {
  _server = server;
}

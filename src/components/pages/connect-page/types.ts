import type Peer from 'peerjs';

export interface Connection {
  peer: Peer;
  tunnel?: string;
}

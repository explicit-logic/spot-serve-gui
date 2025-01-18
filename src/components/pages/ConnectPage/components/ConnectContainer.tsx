import type Peer from 'peerjs';
import { useEffect } from 'react';
import { useAsyncValue, useLocation, useNavigate } from 'react-router';

import Connect from './Connect';

// Lib
import { listenMessage } from '@/lib/peer/listenMessage';

export default function ConnectContainer() {
  const { state } = useLocation() as { state: { file: File } };
  const navigate = useNavigate();
  const peer = useAsyncValue() as Peer;
  const { file } = state || {};

  if (!file || !peer) {
    navigate('/upload');
  }

  const peerId = peer.id;
  const websiteUrl = `https://yakovenkodenis.github.io/spot-serve-web?r=${peerId}`;

  useEffect(() => {
    const unListen = listenMessage(
      'website-zip-archive',
      (connection, { id }) => {
        connection.send({
          id,
          result: file,
        });
      },
    );

    return () => {
      unListen();
    };
  }, [file]);

  const handleDisconnect = () => {
    // Handle disconnect logic
    console.log('Disconnecting...');
  };

  const handleSendMessage = () => {
    // Handle send message logic
    console.log('Sending message...');
  };

  return (
    <Connect
      websiteUrl={websiteUrl}
      onDisconnect={handleDisconnect}
      onSendMessage={handleSendMessage}
    />
  );
}

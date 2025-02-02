import type { Website } from '@/schemas/website';
import type Peer from 'peerjs';
import { useEffect } from 'react';
import { useAsyncValue, useLocation, useNavigate } from 'react-router';

import Connect from './connect';

// Lib
import { listenMessage } from '@/lib/peer/listen-message';

// Config
import { WEBSITE_URL } from '@/config/remote';

export default function ConnectContainer() {
  const { state } = useLocation() as { state: Website };
  const navigate = useNavigate();
  const peer = useAsyncValue() as Peer;
  const { file } = state || {};

  if (!file || !peer) {
    navigate('/upload');
  }

  const peerId = peer.id;
  const websiteUrl = `${WEBSITE_URL}?r=${peerId}`;

  useEffect(() => {
    const unListen = listenMessage(
      'website-zip-archive',
      (connection, { id }) => {
        connection.send({
          id,
          result: state,
        });
      },
    );

    return () => {
      unListen();
    };
  }, [state]);

  const goBack = () => {
    // Handle disconnect logic
    navigate('/upload');
  };

  return <Connect websiteUrl={websiteUrl} goBack={goBack} />;
}

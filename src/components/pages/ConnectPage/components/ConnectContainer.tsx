import type Peer from 'peerjs';
import {
  useAsyncValue,
  useLoaderData,
  useLocation,
  useNavigate,
} from 'react-router';

import Connect from './Connect';

export default function ConnectContainer() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const peer = useAsyncValue() as Peer;
  const { file } = state || {};

  console.log(file, peer);
  if (!file || !peer) {
    navigate('/upload');
  }

  const peerId = peer.id;
  const websiteUrl = `https://yakovenkodenis.github.io/spot-serve-web?r=${peerId}`;

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

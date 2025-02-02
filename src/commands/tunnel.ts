import { invoke } from '@tauri-apps/api/core';

export async function setupTunnel(port: number, host = '0.0.0.0') {
  const url: string = await invoke('setup_tunnel', {
    localHost: host,
    localPort: Number(port),
  });

  return url;
}

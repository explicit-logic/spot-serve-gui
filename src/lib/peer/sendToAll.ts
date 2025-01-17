import type { TYPES } from '../../constants/message';

// Store
import { getConnections, getServer } from './store';

export async function sendToAll(
  type: (typeof TYPES)[keyof typeof TYPES],
  data: Message['data'],
) {
  const server = getServer();

  if (!server) {
    console.error('Server is not set');
    return;
  }

  for (const connection of getConnections()) {
    await connection.send({
      clientId: server.id,
      type,
      data,
    });
  }
}

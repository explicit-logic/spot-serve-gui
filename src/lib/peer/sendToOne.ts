import type { TYPES } from '../../constants/message';

// Store
import { getConnectionByClientId, getServer } from './store';

export async function sendToOne(
  clientId: Client['id'],
  type: (typeof TYPES)[keyof typeof TYPES],
  data: Message['data'],
) {
  const server = getServer();

  if (!server) {
    console.error('Server is not set');
    return;
  }

  const connection = getConnectionByClientId(clientId);

  if (!connection) {
    console.error(`Client [${clientId}] has no connection`);
    return;
  }

  await connection.send({
    clientId: server.id,
    type,
    data,
  });
}

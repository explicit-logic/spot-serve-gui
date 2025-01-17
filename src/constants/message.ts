export const TYPES = Object.freeze({
  complete: 'complete',
  connect: 'connect',
  identity: 'identity',
  init: 'init',
  message: 'message',
  progress: 'progress',
} as const);

export type MessageType = (typeof TYPES)[keyof typeof TYPES];

export const STATES = Object.freeze({
  OFFLINE: 0,
  ERROR: 1,
  LOADING: 2,
  ONLINE: 3,
} as const);

export type StateType = (typeof STATES)[keyof typeof STATES];

export const CLIENT_EVENTS = Object.freeze({
  CLOSE: 'CLIENT:CLOSE',
  ERROR: 'CLIENT:ERROR',
  MESSAGE: 'CLIENT:MESSAGE',
  OPEN: 'CLIENT:OPEN',
} as const);

export const SERVER_EVENTS = Object.freeze({
  CLOSE: 'SERVER:CLOSE',
  CONNECTION: 'SERVER:CONNECTION',
  ERROR: 'SERVER:ERROR',
  LOADING: 'SERVER:LOADING',
  OPEN: 'SERVER:OPEN',
} as const);

export const STATES = Object.freeze({
  OFFLINE: 0,
  ERROR: 1,
  LOADING: 2,
  ONLINE: 3,
} as const);

export type StateType = (typeof STATES)[keyof typeof STATES];

export const CONNECTION_EVENTS = Object.freeze({
  CLOSE: 'CONNECTION:CLOSE',
  ERROR: 'CONNECTION:ERROR',
  MESSAGE: 'CONNECTION:MESSAGE',
  OPEN: 'CONNECTION:OPEN',
} as const);

export const SERVER_EVENTS = Object.freeze({
  CLOSE: 'SERVER:CLOSE',
  CONNECTION: 'SERVER:CONNECTION',
  ERROR: 'SERVER:ERROR',
  LOADING: 'SERVER:LOADING',
  OPEN: 'SERVER:OPEN',
} as const);

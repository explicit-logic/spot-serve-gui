import type { STATES as CONNECTION_STATES } from '@/constants/connection';
import type { TYPES as MESSAGE_TYPES } from '@/constants/message';

declare global {
  type ThemeModeType = 'auto' | 'dark' | 'light';

  type ConnectionStateType =
    (typeof CONNECTION_STATES)[keyof typeof CONNECTION_STATES];

  interface Client {
    id: string;

    userAgent: string;
    locale: string;
    theme: ThemeModeType;
  }

  type PlatformType = {
    browser: string;
    os: string;
    type: string;
    version: string;
  };

  interface Message {
    id: string;
    method: string;
    params?: any;
  }
}

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

  type Message =
    | Messages.Complete
    | Messages.Connect
    | Messages.Identity
    | Messages.Init
    | Messages.Message
    | Messages.Progress;

  type PlatformType = {
    browser: string;
    os: string;
    type: string;
    version: string;
  };

  namespace Messages {
    interface Complete {
      clientId: string;
      language: string;
      quizId: number;
      type: typeof MESSAGE_TYPES.complete;

      data: {
        result: object;
      };
    }

    interface Connect {
      language: string;
      quizId: number;
      type: typeof MESSAGE_TYPES.connect;

      data: {
        clientId?: string;
        pathname: string;
        platform: PlatformType;
        theme: ThemeModeType;
        timezone: string;
        userAgent: string;
      };
    }

    interface Identity {
      clientId: string;
      language: string;
      quizId: number;
      type: typeof MESSAGE_TYPES.identity;

      data: {
        email: string;
        group?: string;
        name: string;
        context: {
          slugs: string[];
        };
      };
    }

    interface Init {
      type: typeof MESSAGE_TYPES.init;

      data: {
        userAgent: string;
        clientId: string;
        language: string;
        platform: PlatformType;
        theme: ThemeModeType;
        timezone: string;
      };
    }

    interface Message {
      clientId: string;
      language: string;
      quizId: number;
      type: typeof MESSAGE_TYPES.message;

      data: {
        text: string;
      };
    }

    interface Progress {
      clientId: string;
      language: string;
      quizId: number;
      type: typeof MESSAGE_TYPES.progress;

      data: {
        answer: Record<string, string | string[]>;
        current: number;
        page: string;
        total: number;
      };
    }
  }

  interface ResponderInterface {
    id: number;
    clientId: string;
    quizId: number;

    completed: boolean;
    connectedAt: Date;

    identified: boolean;

    language: string;
    platform: PlatformType;
    progress: number;
    timezone: string;

    state: ConnectionStateType; // virtual

    userAgent: string;

    email?: string;
    name?: string;
    theme?: ThemeModeType;
    group?: string;

    startAt?: Date;
    finishAt?: Date;

    context: {
      slugs: string[];
    };
  }
}

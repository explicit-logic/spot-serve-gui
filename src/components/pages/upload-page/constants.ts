export const TABS = {
  DIRECTORY: 'directory',
  UPLOAD: 'upload',
} as const;

export type TabsType = (typeof TABS)[keyof typeof TABS];

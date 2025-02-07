import { z } from 'zod';

export const schema = z.object({
  backend: z.boolean().default(false),
  directory: z.string().optional(),
  port: z
    .union([z.string().regex(/^\d+$/).transform(Number), z.number()])
    .refine((n) => n >= 1 && n <= 65535, {
      message: 'Port must be between 1 and 65535',
    }),
  file: z.instanceof(File, {
    message: 'Provide a file or directory with your website',
  }),
});

export type Values = z.infer<typeof schema>;

export interface Website extends Values {
  tunnel?: string;
}

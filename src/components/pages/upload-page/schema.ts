import { z } from 'zod';

const HOST_MESSAGE = 'Please enter a valid URL or IP address';

export const schema = z.object({
  host: z.union([
    z.string().url({ message: HOST_MESSAGE }),
    z.string().ip({ message: HOST_MESSAGE }),
  ]),
  port: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .refine((n) => n >= 1 && n <= 65535, {
      message: 'Port must be between 1 and 65535',
    }),
  file: z.instanceof(File, {
    message: 'Provide a file or directory with your website',
  }),
});

export type Values = z.infer<typeof schema>;

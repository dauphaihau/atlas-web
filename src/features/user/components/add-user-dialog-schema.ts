import { z } from 'zod';
import { addUserRoleValues } from './add-user-dialog-roles';

export const addUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required.')
    .max(255, 'Name must be at most 255 characters.'),
  email: z.string().min(1, 'Email is required.').email('Enter a valid email.'),
  role: z.enum(addUserRoleValues),
  send_invite: z.boolean(),
  password: z
    .string()
    .max(255, 'Password must be at most 255 characters.')
    .optional()
    .or(z.literal('')),
}).superRefine((values, ctx) => {
  if (!values.send_invite && (!values.password || values.password.length < 8)) {
    ctx.addIssue({
      code: 'custom',
      path: ['password'],
      message: 'Password must be at least 8 characters.',
    });
  }
});

export type AddUserFormValues = z.infer<typeof addUserSchema>;

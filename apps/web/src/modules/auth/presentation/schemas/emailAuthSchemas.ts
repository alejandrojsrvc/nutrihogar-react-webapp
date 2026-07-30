import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .email('Ingresa un correo electronico valido.');
const passwordSchema = z.string().min(1, 'Ingresa tu contrasena.');

export const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const registerFormSchema = z
  .object({
    fullName: z.string().trim().min(1, 'Ingresa tu nombre completo.'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Las contrasenas no coinciden.',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerFormSchema>;

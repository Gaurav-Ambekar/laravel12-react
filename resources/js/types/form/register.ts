import { z } from 'zod';
export const RegisterSchema = z
    .object({
        fullname: z.string().min(3, 'Name must be at least 3 characters').max(50, 'Name must not exceed 50 characters'),

        mobile_no: z
            .string()
            .optional()
            .refine((val) => !val || /^[0-9]{10}$/.test(val), {
                message: 'Mobile number must be exactly 10 digits',
            }),

        email: z
            .string()
            .optional()
            .refine((val) => !val || (val.length >= 3 && z.string().email().safeParse(val).success), {
                message: 'Invalid email format',
            }),

        username: z
            .string()
            .min(3, 'Username must be at least 3 characters')
            .max(50, 'Username must not exceed 50 characters')
            .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),

        password: z.string().min(6, 'Password must be at least 6 characters'),

        // Match with password
        password_confirmation: z.string().min(6, 'Password must be at least 6 characters'),

        branch_id: z
            .string()
            .min(1, 'Branch is required')
            .refine((val) => val !== '0', {
                message: 'Please select a valid branch',
            }),

        branch_name: z.string().optional(),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: 'Passwords do not match',
        path: ['password_confirmation'],
    });

export type RegisterFormData = z.infer<typeof RegisterSchema>;

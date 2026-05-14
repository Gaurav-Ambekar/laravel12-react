import { z } from 'zod';

export const loginSchema = z.object({
    financial_year: z
        .string()
        .min(1, 'Financial year is required')
        .regex(/^\d{4}-\d{4}$/, 'Financial year must be in YYYY-YYYY format'),

    branch_id: z
        .string()
        .min(1, 'Branch is required')
        .refine((val) => val !== '0', {
            message: 'Please select a valid branch',
        }),

    username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(50, 'Username must not exceed 50 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),

    password: z.string().min(6, 'Password must be at least 6 characters'),

    remember: z.boolean().optional().default(false),
});

export type LoginFormData = z.infer<typeof loginSchema>;

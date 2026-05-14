import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ZodError } from 'zod';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function normalizeZodErrors(error: ZodError): Record<string, string> {
    const fieldErrors: Record<string, string> = {};

    const flattened = error.flatten().fieldErrors;

    Object.entries(flattened).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) fieldErrors[key] = value[0];
    });

    return fieldErrors;
}

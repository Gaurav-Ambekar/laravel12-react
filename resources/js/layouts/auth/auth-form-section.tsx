import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { cn } from '@/lib/utils';
import AuthFooter from '../auth-footer';
import { ReactNode } from 'react';

interface AuthFormSectionProps {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
    maxWidth?: 'sm' | 'md' | 'lg';
}

export default function AuthFormSection({
    title,
    description,
    children,
    className,
    maxWidth = 'md',
}: AuthFormSectionProps) {
    const maxWidthClass = {
        sm: 'lg:max-w-sm',
        md: 'lg:max-w-lg',
        lg: 'lg:max-w-2xl',
    }[maxWidth];

    return (
        <section role="main" className={cn('relative flex w-full flex-col items-end justify-start gap-5', className)}>
            {/* Theme toggle */}
            <div className="m-4 ms-auto w-fit">
                <AppearanceToggleDropdown />
            </div>

            {/* Form content area */}
            <div className={cn('w-md max-w-md px-4', maxWidthClass)}>
                {/* Title and description */}
                <div className="mb-5">
                    <h1 className="text-primary text-2xl leading-snug! font-extrabold uppercase md:text-3xl">{title}</h1>
                    {description && <p className="text-base leading-normal font-bold">{description}</p>}
                </div>

                {/* Form content */}
                {children}
            </div>

            {/* Footer */}
            <AuthFooter />
        </section>
    );
}

import AppLogoIcon from '@/components/app-logo-icon';
import { useCompany } from '@/hooks/use-company';
import { cn } from '@/lib/utils';

interface AuthBrandingProps {
    variant?: 'default' | 'minimal';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function AuthBranding({ variant = 'default', size = 'md', className }: AuthBrandingProps) {
    const company = useCompany();

    const iconSize = {
        sm: 'size-6',
        md: 'size-9',
        lg: 'size-12',
    }[size];

    const textSize = {
        sm: 'text-lg md:text-xl',
        md: 'text-2xl md:text-3xl',
        lg: 'text-3xl md:text-4xl',
    }[size];

    return (
        <div className={cn('flex items-center justify-center gap-2 rounded-md', className)}>
            <AppLogoIcon className={cn('fill-current text-[var(--foreground)]', iconSize)} />
            <p className={cn('text-primary text-center leading-snug! font-extrabold uppercase', textSize)}>
                {company?.name}
            </p>
        </div>
    );
}

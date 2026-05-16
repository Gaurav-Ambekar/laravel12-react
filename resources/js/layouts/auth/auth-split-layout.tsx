import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import AuthBackgroundDecorations from './auth-background-decorations';
import AuthFormSection from './auth-form-section';
import AuthHeroSection from './auth-hero-section';

interface AuthSplitLayoutProps {
    children: ReactNode;
    title: string;
    description?: string;
    variant?: 'default' | 'minimal';
    showHero?: boolean;
    heroChildren?: ReactNode;
    heroShowDecoration?: boolean;
    formMaxWidth?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function AuthSplitLayout({
    children,
    title,
    description,
    variant = 'default',
    showHero = true,
    heroChildren,
    heroShowDecoration = true,
    formMaxWidth = 'md',
    className,
}: AuthSplitLayoutProps) {
    return (
        <div className={cn('relative min-h-screen overflow-hidden', className)}>
            {/* Background with map pattern */}
            <div className="relative flex items-center justify-center bg-[url('/assets/images/map.png')] bg-cover bg-center bg-no-repeat px-6 py-10 sm:px-16">
                {/* Background decorations */}
                <AuthBackgroundDecorations variant={variant} />

                {/* Main layout container */}
                <div className="relative flex w-full flex-col justify-between overflow-hidden rounded-md backdrop-blur-lg lg:flex-row lg:gap-10 xl:gap-0">
                    {/* Hero section */}
                    {showHero && (
                        <AuthHeroSection variant={variant} showDecoration={heroShowDecoration}>
                            {heroChildren}
                        </AuthHeroSection>
                    )}

                    {/* Form section */}
                    <AuthFormSection title={title} description={description} maxWidth={formMaxWidth}>
                        {children}
                    </AuthFormSection>
                </div>
            </div>
        </div>
    );
}

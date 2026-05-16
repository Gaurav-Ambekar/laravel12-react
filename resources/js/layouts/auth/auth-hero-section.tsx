import { cn } from '@/lib/utils';
import loginDarkSvg from '@images/auth/login-dark.svg';
import loginSvg from '@images/auth/login.svg';
import { ReactNode } from 'react';
import AuthBranding from './auth-branding';

interface AuthHeroSectionProps {
    children?: ReactNode;
    showDecoration?: boolean;
    variant?: 'default' | 'minimal';
    className?: string;
}

export default function AuthHeroSection({ children, showDecoration = true, variant = 'default', className }: AuthHeroSectionProps) {
    return (
        <section
            role="complementary"
            className={cn(
                'relative hidden w-full items-center justify-center bg-[linear-gradient(225deg,rgba(239,18,98,1)_0%,rgba(67,97,238,1)_100%)] p-5 lg:inline-flex lg:max-w-208.75 xl:-ms-32 ltr:xl:skew-x-14 rtl:xl:skew-x-[-14deg]',
                className,
            )}
        >
            {/* Gradient glow effect */}
            <div className="from-primary/10 absolute inset-y-0 w-8 via-transparent to-transparent xl:w-16 ltr:-right-10 ltr:bg-linear-to-r ltr:xl:-right-20 rtl:-left-10 rtl:bg-linear-to-l rtl:xl:-left-20"></div>

            {/* Content wrapper with skew counter */}
            <div className="ltr:xl:-skew-x-14 rtl:xl:skew-x-14">
                {/* Branding */}
                {children ? (
                    children
                ) : (
                    <>
                        <div className="mb-1">
                            <AuthBranding />
                        </div>

                        {/* Login illustration */}
                        <div className="mt-24 hidden w-full max-w-107.5 lg:block">
                            <img src={loginSvg} alt="Light Mode Login Illustration" className="h-full w-full object-cover dark:hidden" />
                            <img src={loginDarkSvg} alt="Dark Mode Login Illustration" className="hidden h-full w-full object-cover dark:block" />
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}

import ScrollToTop from '@/components/scroll-to-top';
import { ReactNode } from 'react';
import { Toaster } from 'sonner';

export function RootLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <ScrollToTop />
            {children}
            <Toaster richColors closeButton position="top-right" />
        </>
    );
}

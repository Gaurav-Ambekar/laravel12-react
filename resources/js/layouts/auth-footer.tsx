import { cn } from '@/lib/utils';

export default function AuthFooter({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                'text-muted-foreground mt-auto flex w-auto justify-between p-3 text-center text-xs ltr:sm:text-left rtl:sm:text-right',
                className,
            )}
        >
            <p className="hidden sm:block">
                © <span id="footer-year">2025-2026</span>
            </p>
            <div className="mx-3 my-1 hidden w-px sm:block"></div>
            <p>
                Powered by <b> Interlink Consultant</b>
            </p>
            <div className="mx-3 my-1 hidden w-px sm:block"></div>
            <p className="hidden sm:block">All Rights Reserved.</p>
        </div>
    );
}

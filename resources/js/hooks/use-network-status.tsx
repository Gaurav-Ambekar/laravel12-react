import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export function useNetworkStatus() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const prevStatusRef = useRef(navigator.onLine);
    const offlineToastCountRef = useRef(0);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);

            if (!prevStatusRef.current) {
                // Dismiss ALL toasts (including offline ones)
                toast.dismiss();

                // Show single success toast
                toast.success('Connection restored', {
                    duration: 3000,
                    icon: '✅',
                });

                offlineToastCountRef.current = 0;
            }
            prevStatusRef.current = true;
        };

        const handleOffline = () => {
            setIsOnline(false);

            if (prevStatusRef.current) {
                // Limit to 3 offline toasts max to avoid spam
                if (offlineToastCountRef.current < 3) {
                    toast.error('No internet connection', {
                        duration: Infinity,
                        icon: '📡',
                        id: 'offline-toast', // Same ID reuses same toast
                    });
                    offlineToastCountRef.current++;
                }
            }
            prevStatusRef.current = false;
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            toast.dismiss();
        };
    }, []);

    return { isOnline, isOffline: !isOnline };
}

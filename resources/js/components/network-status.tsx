import { useNetworkStatus } from '@/hooks/use-network-status';
import { WifiOff } from 'lucide-react';

export default function NetworkStatus() {
    const { isOnline } = useNetworkStatus();

    if (isOnline) return null;

    return (
        <div className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-white shadow-lg">
            <WifiOff className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-medium">Offline</span>
        </div>
    );
}

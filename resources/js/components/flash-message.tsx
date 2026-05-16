import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
interface FlashMessages {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

const DURATIONS: Record<keyof FlashMessages, number> = {
    success: 4000,
    error: 7000,
    warning: 6000,
    info: 5000,
};

type PageProps = {
    flash?: FlashMessages;
};

export function FlashMessage() {
    const { props } = usePage<PageProps>();
    const flash = props.flash || {};
    useEffect(() => {
        if (flash.success) toast.success(flash.success, { duration: DURATIONS.success });
        if (flash.error) toast.error(flash.error, { duration: DURATIONS.error });
        if (flash.warning) toast.warning(flash.warning, { duration: DURATIONS.warning });
        if (flash.info) toast.info(flash.info, { duration: DURATIONS.info });
    }, [flash]);
    return null;
}

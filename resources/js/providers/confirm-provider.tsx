import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { createContext, useState } from 'react';

type ConfirmOptions = {
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
};

type ConfirmContextType = (options: ConfirmOptions) => Promise<boolean>;

export const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<{
        open: boolean;
        options: ConfirmOptions;
        resolve: (value: boolean) => void;
    } | null>(null);

    const confirm: ConfirmContextType = (options) => {
        return new Promise((resolve) => {
            setState({
                open: true,
                options,
                resolve,
            });
        });
    };

    const handleClose = (value: boolean) => {
        state?.resolve(value);
        setState(null);
    };

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}

            <AlertDialog
                open={!!state?.open}
                onOpenChange={(open) => {
                    if (!open) handleClose(false);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{state?.options.title ?? 'Are you sure?'}</AlertDialogTitle>
                        <AlertDialogDescription>{state?.options.description ?? ''}</AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => handleClose(false)}>{state?.options.cancelText ?? 'Cancel'}</AlertDialogCancel>

                        <AlertDialogAction onClick={() => handleClose(true)}>{state?.options.confirmText ?? 'Confirm'}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </ConfirmContext.Provider>
    );
}

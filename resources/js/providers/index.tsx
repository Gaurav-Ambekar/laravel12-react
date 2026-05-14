import { ErrorBoundary } from '@/components/error-boundary';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ConfirmProvider } from '@/providers/confirm-provider';
import { ReactNode } from 'react';

// Define clear order
const providerOrder = [
    ErrorBoundary, // Error boundary
    TooltipProvider, // UI primitives first
    ConfirmProvider, // Dependent features,
] as const;

// Provider wrapper component
function ComposeProviders({ providers, children }: { providers: readonly any[]; children: ReactNode }) {
    return providers.reduceRight((child, Provider) => <Provider>{child}</Provider>, children);
}

// Main provider component
export function AppProviders({ children }: { children: ReactNode }) {
    return <ComposeProviders providers={providerOrder}>{children}</ComposeProviders>;
}

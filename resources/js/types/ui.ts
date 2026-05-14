import { ReactNode } from 'react';

export type AppLayoutProps = {
    children: ReactNode;
};

export type AppVariant = 'header' | 'sidebar';

export type AuthLayoutProps = {
    children?: ReactNode;
    name?: string;
    title?: string;
    description?: string;
};

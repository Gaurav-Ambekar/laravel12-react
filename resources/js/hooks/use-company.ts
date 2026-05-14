import { Company } from '@/types';
import { usePage } from '@inertiajs/react';

export function useCompany() {
    const { props } = usePage<{ company: Company }>();
    return props.company;
}

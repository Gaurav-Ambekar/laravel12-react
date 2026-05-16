import { cn } from '@/lib/utils';
import object1Png from '@images/auth/object-1.png';
import object2Png from '@images/auth/object-2.png';
import object3Png from '@images/auth/object-3.png';
import polygonObjectSvg from '@images/auth/polygon-object.svg';

interface AuthBackgroundDecorationsProps {
    variant?: 'default' | 'minimal';
    className?: string;
}

export default function AuthBackgroundDecorations({ variant = 'default', className }: AuthBackgroundDecorationsProps) {
    if (variant === 'minimal') return null;

    return (
        <>
            <img
                src={object1Png}
                alt="Decorative"
                aria-hidden="true"
                className={cn('absolute top-1/2 left-0 h-full max-h-223.25 -translate-y-1/2', className)}
            />
            <img src={object2Png} alt="Decorative" aria-hidden="true" className={cn('absolute top-0 left-24 h-40 md:left-[30%]', className)} />
            <img src={object3Png} alt="Decorative" aria-hidden="true" className={cn('absolute top-0 right-0 h-75', className)} />
            <img src={polygonObjectSvg} alt="Decorative" aria-hidden="true" className={cn('inset-e-[28%] absolute bottom-0', className)} />
        </>
    );
}

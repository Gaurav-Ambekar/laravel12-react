import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';

export default function ScrollToTop() {
    const [visible, setVisible] = useState(false);
    const [atBottom, setAtBottom] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            // Check if the page is scrollable at all
            const isPageScrollable = documentHeight > windowHeight + 1;

            if (!isPageScrollable) {
                // If page is not scrollable, hide the button
                setVisible(false);
                setAtBottom(false);
                return;
            }

            // Show when scrolled 100px or at bottom
            const isAtBottom = windowHeight + scrollTop >= documentHeight - 10;

            setAtBottom(isAtBottom);
            setVisible(scrollTop > 100 || isAtBottom);
        };

        // Function to check scrollability with a small delay
        const checkScrollable = () => {
            // Reset to hidden first
            setVisible(false);
            setAtBottom(false);

            // Then check after a short delay to ensure DOM is ready
            setTimeout(handleScroll, 100);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll);

        // Check on initial mount
        setTimeout(handleScroll, 100);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
            // Reset visibility on unmount
            setVisible(false);
            setAtBottom(false);
        };
    }, []);

    // Separate effect for Inertia navigation events
    useEffect(() => {
        // Create event handler for navigation
        const handleNavigation = () => {
            // Hide button immediately on navigation start
            setVisible(false);
            setAtBottom(false);

            // Check again after navigation completes
            setTimeout(() => {
                const scrollTop = window.scrollY;
                const windowHeight = window.innerHeight;
                const documentHeight = document.documentElement.scrollHeight;

                const isPageScrollable = documentHeight > windowHeight + 1;

                if (!isPageScrollable) {
                    setVisible(false);
                    setAtBottom(false);
                    return;
                }

                const isAtBottom = windowHeight + scrollTop >= documentHeight - 100;
                setAtBottom(isAtBottom);
                setVisible(scrollTop > 100 || isAtBottom);
            }, 150);
        };

        // Listen to Inertia navigation events
        const removeStartListener = router.on('start', () => {
            setVisible(false);
            setAtBottom(false);
        });

        const removeFinishListener = router.on('finish', handleNavigation);
        const removeErrorListener = router.on('error', () => {
            setVisible(false);
            setAtBottom(false);
        });

        return () => {
            // Clean up event listeners
            if (removeStartListener) removeStartListener();
            if (removeFinishListener) removeFinishListener();
            if (removeErrorListener) removeErrorListener();
        };
    }, []);

    function goToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Optional: Add haptic feedback to mobile
        if (navigator.vibrate) navigator.vibrate(50);
    }

    return (
        <Button
            type="button"
            variant={atBottom ? 'default' : 'secondary'}
            className={cn(
                'fixed right-6 bottom-6 z-50 rounded-full p-3 shadow-lg transition-all duration-300',
                'bg-primary text-primary-foreground hover:scale-110 active:scale-95',
                visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-10 opacity-0',
                atBottom && 'animate-bounce',
            )}
            onClick={goToTop}
            size="icon"
            aria-label="Scroll to top"
        >
            <ArrowUp />
        </Button>
    );
}

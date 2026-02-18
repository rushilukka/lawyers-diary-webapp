import { useState, useEffect } from 'react';
import '../styles/InstallPrompt.css';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Only show on mobile/tablet
        const isMobile = /Android|iPhone|iPad|iPod|tablet|mobile/i.test(navigator.userAgent) ||
            window.innerWidth <= 768;

        if (!isMobile) return;

        // Check if user already dismissed
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed) return;

        // Check if already installed (standalone mode)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;
        if (isStandalone) return;

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowBanner(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setShowBanner(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowBanner(false);
        localStorage.setItem('pwa-install-dismissed', 'true');
        setDeferredPrompt(null);
    };

    if (!showBanner) return null;

    return (
        <div className="install-prompt-overlay">
            <div className="install-prompt-banner">
                <div className="install-prompt-content">
                    <div className="install-prompt-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 2a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 6.095 0 7.555 0 9.318 0 11.366 1.708 13 3.781 13h8.906C14.502 13 16 11.57 16 9.773c0-1.636-1.242-2.969-2.834-3.194C12.923 3.999 10.69 2 8 2m2.354 5.146a.5.5 0 0 1-.708.708L8.5 6.707V10.5a.5.5 0 0 1-1 0V6.707L6.354 7.854a.5.5 0 1 1-.708-.708l2-2a.5.5 0 0 1 .708 0z" />
                        </svg>
                    </div>
                    <div className="install-prompt-text">
                        <strong>Install Lawyer's Diary</strong>
                        <span>Add to home screen for a better experience</span>
                    </div>
                </div>
                <div className="install-prompt-actions">
                    <button className="install-prompt-btn install-prompt-btn-dismiss" onClick={handleDismiss}>
                        Not Now
                    </button>
                    <button className="install-prompt-btn install-prompt-btn-install" onClick={handleInstall}>
                        Install
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstallPrompt;

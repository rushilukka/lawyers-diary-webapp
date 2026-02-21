import { useEffect, useState } from 'react';
import { Container, Navbar, Button, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const AppNavbar = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<{ name: string } | null>(null);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Failed to parse user data', e);
                localStorage.removeItem('user');
            }
        }

        // Hide button if already running as installed PWA
        const isStandalone =
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;
        if (isStandalone) {
            setIsInstalled(true);
            return;
        }

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Also listen for successful install
        window.addEventListener('appinstalled', () => setIsInstalled(true));

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsInstalled(true);
        }
    };

    const handleLogout = async () => {
        try {
            await authApi.logout();
        } catch {
            // Even if logout API fails, clear local state
        }
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <Navbar expand="lg" style={{ backgroundColor: '#000000' }} variant="dark">
            <Container>
                <Navbar.Brand href="/dashboard" style={{ color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img
                        src="/icons/logo-192x192.png"
                        alt="Diary by Davda logo"
                        width={32}
                        height={32}
                        style={{ objectFit: 'contain', borderRadius: '6px' }}
                    />
                    Diary by Davda
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                    <Nav className="align-items-center gap-2">
                        <Navbar.Text className="text-white">
                            Welcome, {user?.name}
                        </Navbar.Text>

                        {/* PWA Install button — shown only when prompt is available and not yet installed */}
                        {!isInstalled && deferredPrompt && (
                            <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={handleInstall}
                                title="Install App"
                                style={{ display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}
                            >
                                {/* Download / Install icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
                                    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z" />
                                </svg>
                                Install App
                            </Button>
                        )}

                        <Button variant="outline-light" size="sm" onClick={handleLogout}>Logout</Button>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default AppNavbar;

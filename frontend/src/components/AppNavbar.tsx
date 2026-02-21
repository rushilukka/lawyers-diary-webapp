import { useEffect, useState, useRef } from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { authApi } from '../api/auth';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const AppNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<{ name: string } | null>(null);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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
        window.addEventListener('appinstalled', () => setIsInstalled(true));

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
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
        setDropdownOpen(false);
        try {
            await authApi.logout();
        } catch {
            // silently ignore
        }
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <Navbar expand="lg" style={{ backgroundColor: '#000000' }} variant="dark" className="app-navbar">
            <Container>
                {/* Brand */}
                <Navbar.Brand href="/dashboard" style={{ color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img
                        src="/icons/logo-512x512.png"
                        alt="Diary by Davda logo"
                        width={56}
                        height={56}
                        style={{ objectFit: 'contain', borderRadius: '6px' }}
                    />
                    Diary by Davda
                </Navbar.Brand>

                {/* Hamburger toggler for mobile */}
                <Navbar.Toggle aria-controls="main-navbar-nav" />

                <Navbar.Collapse id="main-navbar-nav">
                    {/* Left nav links — MyCases, Analytics */}
                    <Nav className="me-auto align-items-lg-center ms-lg-3 navbar-tabs">
                        <Nav.Link
                            as={NavLink}
                            to="/dashboard"
                            className={`navbar-tab-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                        >
                            MyCases
                        </Nav.Link>
                        <Nav.Link
                            as={NavLink}
                            to="/analytics"
                            className={`navbar-tab-link ${location.pathname === '/analytics' ? 'active' : ''}`}
                        >
                            Analytics
                        </Nav.Link>
                    </Nav>

                    {/* Right section: Install + User dropdown */}
                    <Nav className="align-items-lg-center gap-2">
                        {/* PWA Install button */}
                        {!isInstalled && deferredPrompt && (
                            <Nav.Link
                                onClick={handleInstall}
                                className="navbar-install-btn"
                                title="Install App"
                                style={{ display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap', color: '#ffc107', fontSize: '0.875rem' }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
                                    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z" />
                                </svg>
                                Install App
                            </Nav.Link>
                        )}

                        {/* User dropdown */}
                        <div className="navbar-user-wrapper" ref={dropdownRef}>
                            <button
                                className="navbar-user-btn"
                                onClick={() => setDropdownOpen(prev => !prev)}
                                aria-expanded={dropdownOpen}
                                title="Account"
                            >
                                {/* User icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.025 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                                </svg>
                                <span className="navbar-user-name">{user?.name ?? 'Account'}</span>
                                {/* Chevron */}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="12"
                                    height="12"
                                    fill="currentColor"
                                    viewBox="0 0 16 16"
                                    style={{ transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', opacity: 0.6 }}
                                >
                                    <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708" />
                                </svg>
                            </button>

                            {dropdownOpen && (
                                <div className="navbar-user-dropdown">
                                    <button
                                        className="navbar-dropdown-item navbar-dropdown-logout"
                                        onClick={handleLogout}
                                    >
                                        {/* Logout icon */}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
                                            <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z" />
                                            <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z" />
                                        </svg>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default AppNavbar;

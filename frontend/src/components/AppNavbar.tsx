import { useEffect, useState } from 'react';
import { Container, Navbar, Button, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';

const AppNavbar = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<{ name: string } | null>(null);

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
    }, []);

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
        <Navbar expand="lg" style={{ backgroundColor: 'var(--bs-brown-primary)' }} variant="dark">
            <Container>
                <Navbar.Brand href="/dashboard" style={{ color: 'var(--bs-yellow-accent)' }}>Lawyer's Diary</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                    <Nav>
                        <Navbar.Text className="me-3 text-white">
                            Welcome, {user?.name}
                        </Navbar.Text>
                        <Button variant="outline-light" size="sm" onClick={handleLogout}>Logout</Button>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default AppNavbar;

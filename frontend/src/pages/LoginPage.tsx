import { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { authApi } from '../api/auth';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionExpired, setSessionExpired] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('reason') === 'session_expired') {
            setSessionExpired(true);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authApi.login(email, password, rememberMe);
            localStorage.setItem('user', JSON.stringify({
                name: response.name,
                email: response.email
            }));
            // Full page reload so App.tsx re-runs auth check with new cookies
            window.location.href = '/dashboard';
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="full-height-center">
            <Container className="d-flex justify-content-center">
                <Card className="shadow p-4" style={{ width: '100%', maxWidth: '400px' }}>
                    <Card.Body>
                        <div className="text-center mb-4">
                            <h2>Diary by Davda</h2>
                            <p className="text-muted">Please sign in to continue</p>
                        </div>

                        {sessionExpired && (
                            <Alert variant="warning" onClose={() => setSessionExpired(false)} dismissible>
                                ⏱ Your session has expired. Please sign in again.
                            </Alert>
                        )}
                        {error && <Alert variant="danger">{error}</Alert>}

                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                <Form.Label>Email address</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Enter email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formBasicPassword">
                                <Form.Label>Password</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                        style={{ borderColor: '#ced4da' }}
                                    >
                                        {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                    </Button>
                                </InputGroup>
                            </Form.Group>

                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <Form.Check
                                    type="checkbox"
                                    id="rememberMe"
                                    label="Remember Me"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                            </div>

                            <Button
                                variant="primary"
                                type="submit"
                                className="w-100 mb-3"
                                disabled={loading}
                                style={{
                                    backgroundColor: 'var(--bs-brown-primary)',
                                    borderColor: 'var(--bs-brown-primary)',
                                }}
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default LoginPage;

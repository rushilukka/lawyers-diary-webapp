import { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authApi.login(email, password);
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify({
                _id: response._id,
                name: response.name,
                email: response.email
            }));
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="full-height-center" style={{ backgroundColor: 'var(--bs-primary)' }}>
            <Container className="d-flex justify-content-center">
                <Card className="shadow p-4" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--bs-background-white)' }}>
                    <Card.Body>
                        <div className="text-center mb-4">
                            <h2 style={{ color: 'var(--bs-brown-primary)' }}>Lawyer's Diary</h2>
                            <p className="text-muted">Please sign in to continue</p>
                        </div>

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

                            <Form.Group className="mb-4" controlId="formBasicPassword">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </Form.Group>

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

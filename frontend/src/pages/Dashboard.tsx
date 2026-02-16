import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Navbar, Button, Table, Spinner, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { casesApi, type Case } from '../api/cases';

const Dashboard = () => {
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [user, setUser] = useState<{ name: string } | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Failed to parse user data', e);
                localStorage.removeItem('user'); // Clear invalid data
            }
        }

        const fetchCases = async () => {
            try {
                const data = await casesApi.getAllCases();
                setCases(data);
            } catch (err: any) {
                setError('Failed to load cases. Please try again.');
                if (err.response && err.response.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCases();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <>
            <Navbar expand="lg" style={{ backgroundColor: 'var(--bs-brown-primary)' }} variant="dark">
                <Container>
                    <Navbar.Brand href="#home" style={{ color: 'var(--bs-yellow-accent)' }}>Lawyer's Diary</Navbar.Brand>
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

            <Container className="mt-4 layout-container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 style={{ color: 'var(--bs-brown-dark)' }}>My Cases</h2>
                    <Button style={{ backgroundColor: 'var(--bs-yellow-accent)', color: 'black', border: 'none' }}>
                        + New Case
                    </Button>
                </div>

                {loading ? (
                    <div className="text-center mt-5">
                        <Spinner animation="border" role="status" variant="primary">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger">{error}</div>
                ) : (
                    <Row>
                        {/* Desktop View - Table */}
                        <Col className="d-none d-md-block">
                            <Card className="shadow-sm border-0">
                                <Card.Body className="p-0">
                                    <Table hover responsive className="mb-0">
                                        <thead style={{ backgroundColor: 'var(--bs-brown-light)', color: 'white' }}>
                                            <tr>
                                                <th>Case No</th>
                                                <th>Title</th>
                                                <th>Contact Person</th>
                                                <th>Status</th>
                                                <th>Next Date</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cases.length > 0 ? (
                                                cases.map((c) => (
                                                    <tr key={c._id}>
                                                        <td className="fw-bold">{c.case_number}</td>
                                                        <td>{c.case_title}</td>
                                                        <td>
                                                            {c.contact_person_name}
                                                            <br />
                                                            <small className="text-muted">{c.contact_person_phone}</small>
                                                        </td>
                                                        <td>
                                                            <span className={`badge ${c.matter_disposed === 'pending' ? 'bg-success' : 'bg-secondary'}`}>
                                                                {c.matter_disposed === 'pending' ? 'Open' : c.matter_disposed}
                                                            </span>
                                                        </td>
                                                        <td>{new Date(c.next_date).toLocaleDateString()}</td>
                                                        <td>
                                                            <Button size="sm" variant="outline-primary">View</Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="text-center py-4">No cases found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Mobile View - Cards */}
                        <Col className="d-md-none">
                            {cases.length > 0 ? (
                                cases.map((c) => (
                                    <Card key={c._id} className="mb-3 shadow-sm border-0">
                                        <Card.Body>
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <h5 className="card-title fw-bold text-primary mb-0">{c.case_number}</h5>
                                                <span className={`badge ${c.matter_disposed === 'pending' ? 'bg-success' : 'bg-secondary'}`}>
                                                    {c.matter_disposed === 'pending' ? 'Open' : c.matter_disposed}
                                                </span>
                                            </div>
                                            <h6 className="card-subtitle mb-2 text-muted">{c.case_title}</h6>
                                            <p className="card-text mb-1">
                                                <strong>Contact:</strong> {c.contact_person_name} ({c.contact_person_phone})
                                            </p>
                                            <hr />
                                            <div className="d-flex justify-content-between align-items-center">
                                                <small className="text-muted">Next Date:</small>
                                                <span className="fw-bold text-danger">
                                                    {new Date(c.next_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                ))
                            ) : (
                                <div className="text-center py-4">No cases found.</div>
                            )}
                        </Col>
                    </Row>
                )}
            </Container>
        </>
    );
};

export default Dashboard;

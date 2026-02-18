import { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Card, Button, Table, Spinner, Form, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { casesApi, type Case } from '../api/cases';

const SEARCH_FIELDS = [
    { value: '', label: 'All Fields' },
    { value: 'case_number', label: 'Case Number' },
    { value: 'case_title', label: 'Case Title' },
    { value: 'contact_person_name', label: 'Contact Person' },
    { value: 'contact_person_phone', label: 'Phone' },
    { value: 'notes', label: 'Notes' },
    { value: 'matter_disposed', label: 'Status' },
];

const Dashboard = () => {
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Search state
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchField, setSearchField] = useState('');
    const [filteredCases, setFilteredCases] = useState<Case[] | null>(null);
    const [searching, setSearching] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
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

    // Focus input when search opens
    useEffect(() => {
        if (searchOpen && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 300);
        }
    }, [searchOpen]);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) return;

        setSearching(true);
        try {
            const results = await casesApi.searchCases(searchQuery.trim(), searchField || undefined);
            setFilteredCases(results);
        } catch (err: any) {
            setError('Search failed. Please try again.');
        } finally {
            setSearching(false);
        }
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setSearchField('');
        setFilteredCases(null);
        setSearchOpen(false);
    };

    const displayCases = filteredCases !== null ? filteredCases : cases;

    return (
        <>
            <Container className="mt-4 layout-container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 style={{ color: 'var(--bs-brown-dark)' }}>My Cases</h2>
                    <div className="d-flex align-items-center gap-2">
                        {/* Search */}
                        <div className={`search-wrapper ${searchOpen ? 'search-expanded' : ''}`}>
                            {!searchOpen ? (
                                <Button
                                    variant="outline-secondary"
                                    className="search-icon-btn"
                                    onClick={() => setSearchOpen(true)}
                                    title="Search cases"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                                    </svg>
                                </Button>
                            ) : (
                                <Form onSubmit={handleSearch} className="search-bar-form">
                                    <InputGroup>
                                        <Form.Select
                                            value={searchField}
                                            onChange={(e) => setSearchField(e.target.value)}
                                            className="search-field-select"
                                            style={{ maxWidth: '140px' }}
                                        >
                                            {SEARCH_FIELDS.map((f) => (
                                                <option key={f.value} value={f.value}>{f.label}</option>
                                            ))}
                                        </Form.Select>
                                        <Form.Control
                                            ref={searchInputRef}
                                            type="text"
                                            placeholder="Search cases..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            disabled={searching || !searchQuery.trim()}
                                            title="Search"
                                        >
                                            {searching ? (
                                                <Spinner animation="border" size="sm" />
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                                                </svg>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            onClick={handleClearSearch}
                                            title="Clear search"
                                        >
                                            ✕
                                        </Button>
                                    </InputGroup>
                                </Form>
                            )}
                        </div>

                        {/* Add Case */}
                        <Button
                            style={{ backgroundColor: 'var(--bs-yellow-accent)', color: 'black', border: 'none', whiteSpace: 'nowrap' }}
                            onClick={() => navigate('/add-case')}
                        >
                            + New Case
                        </Button>
                    </div>
                </div>

                {/* Active search indicator */}
                {filteredCases !== null && (
                    <div className="d-flex align-items-center mb-3 search-results-badge">
                        <span className="badge bg-primary me-2">
                            {filteredCases.length} result{filteredCases.length !== 1 ? 's' : ''}
                        </span>
                        <small className="text-muted">
                            Searching for "<strong>{searchQuery}</strong>"
                            {searchField && <> in <strong>{SEARCH_FIELDS.find(f => f.value === searchField)?.label}</strong></>}
                        </small>
                        <Button
                            variant="link"
                            size="sm"
                            className="text-danger ms-2 p-0"
                            onClick={handleClearSearch}
                        >
                            Clear
                        </Button>
                    </div>
                )}

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
                                            {displayCases.length > 0 ? (
                                                displayCases.map((c) => (
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
                                                            <Button size="sm" variant="outline-primary" onClick={() => navigate(`/case/${c._id}`)}>View</Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="text-center py-4">
                                                        {filteredCases !== null ? 'No matching cases found.' : 'No cases found.'}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Mobile View - Cards */}
                        <Col className="d-md-none">
                            {displayCases.length > 0 ? (
                                displayCases.map((c) => (
                                    <Card key={c._id} className="mb-3 shadow-sm border-0" style={{ cursor: 'pointer' }} onClick={() => navigate(`/case/${c._id}`)}>
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
                                <div className="text-center py-4">
                                    {filteredCases !== null ? 'No matching cases found.' : 'No cases found.'}
                                </div>
                            )}
                        </Col>
                    </Row>
                )}
            </Container>
        </>
    );
};

export default Dashboard;

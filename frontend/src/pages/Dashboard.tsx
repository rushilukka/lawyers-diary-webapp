import { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Card, Button, Table, Spinner, Form, InputGroup, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { casesApi, type Case } from '../api/cases';
import { FiEye, FiTrash2, FiX, FiCalendar, FiPhone } from 'react-icons/fi';

const SEARCH_FIELDS = [
    { value: '', label: 'All Fields' },
    { value: 'case_number', label: 'Case Number' },
    { value: 'case_title', label: 'Case Title' },
    { value: 'contact_person_name', label: 'Contact Person' },
    { value: 'contact_person_phone', label: 'Phone' },
    { value: 'notes', label: 'Notes' },
    { value: 'matter_disposed', label: 'Status' },
];

type DateFilterMode = 'exact' | 'month' | 'year';

const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
};

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

    // Date filter state — pre-filter to current month on load
    const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const [dateFilterOpen, setDateFilterOpen] = useState(false);
    const [dateFilterMode, setDateFilterMode] = useState<DateFilterMode>('month');
    const [dateFilterValue, setDateFilterValue] = useState(currentMonth);
    const [dateFilterActive, setDateFilterActive] = useState(true);
    const dateFilterRef = useRef<HTMLDivElement>(null);

    // Delete state
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
    const [deleting, setDeleting] = useState(false);

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

    // Close date filter dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dateFilterRef.current && !dateFilterRef.current.contains(e.target as Node)) {
                setDateFilterOpen(false);
            }
        };
        if (dateFilterOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [dateFilterOpen]);

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

    // Date filter logic
    const applyDateFilter = () => {
        if (!dateFilterValue) return;
        setDateFilterActive(true);
        setDateFilterOpen(false);
    };

    const clearDateFilter = () => {
        setDateFilterValue('');
        setDateFilterActive(false);
        setDateFilterOpen(false);
    };

    const getDateFilterLabel = (): string => {
        if (!dateFilterValue) return '';
        if (dateFilterMode === 'exact') return new Date(dateFilterValue).toLocaleDateString();
        if (dateFilterMode === 'month') {
            const [y, m] = dateFilterValue.split('-');
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${monthNames[parseInt(m, 10) - 1]} ${y}`;
        }
        return dateFilterValue; // year
    };

    const matchesDateFilter = (nextDate: string): boolean => {
        if (!dateFilterActive || !dateFilterValue) return true;
        if (!nextDate) return false;
        const d = new Date(nextDate);
        if (isNaN(d.getTime())) return false;

        if (dateFilterMode === 'exact') {
            const filterDate = new Date(dateFilterValue);
            return d.getFullYear() === filterDate.getFullYear()
                && d.getMonth() === filterDate.getMonth()
                && d.getDate() === filterDate.getDate();
        }
        if (dateFilterMode === 'month') {
            const [y, m] = dateFilterValue.split('-');
            return d.getFullYear() === parseInt(y, 10) && d.getMonth() === parseInt(m, 10) - 1;
        }
        // year
        return d.getFullYear() === parseInt(dateFilterValue, 10);
    };

    const handleDeleteClick = (id: string, title: string) => {
        setDeleteTarget({ id, title });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await casesApi.deleteCase(deleteTarget.id);
            setCases((prev) => prev.filter((c) => c._id !== deleteTarget.id));
            if (filteredCases) {
                setFilteredCases((prev) => prev ? prev.filter((c) => c._id !== deleteTarget.id) : null);
            }
        } catch (err: any) {
            setError('Failed to delete case. Please try again.');
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteTarget(null);
    };

    // Apply both text search and date filter, then sort by next_date ascending (upcoming first)
    const baseCases = filteredCases !== null ? filteredCases : cases;
    const dateFiltered = dateFilterActive ? baseCases.filter(c => matchesDateFilter(c.next_date)) : baseCases;
    const displayCases = [...dateFiltered].sort((a, b) => {
        const dateA = a.next_date ? new Date(a.next_date).getTime() : Infinity;
        const dateB = b.next_date ? new Date(b.next_date).getTime() : Infinity;
        return dateA - dateB;
    });

    return (
        <>
            <Container className="mt-4 layout-container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>My Cases</h2>
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
                                            <FiX size={14} />
                                        </Button>
                                    </InputGroup>
                                </Form>
                            )}
                        </div>

                        {/* Calendar Date Filter */}
                        <div className="date-filter-wrapper" ref={dateFilterRef}>
                            <Button
                                variant={dateFilterActive ? 'primary' : 'outline-secondary'}
                                className="search-icon-btn"
                                onClick={() => setDateFilterOpen(!dateFilterOpen)}
                                title="Filter by Next Date"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
                                </svg>
                                {dateFilterActive && (
                                    <span className="date-filter-dot"></span>
                                )}
                            </Button>

                            {dateFilterOpen && (
                                <div className="date-filter-dropdown">
                                    <div className="date-filter-header">
                                        <strong>Filter by Next Date</strong>
                                    </div>

                                    <div className="date-filter-modes">
                                        <button
                                            className={`date-mode-btn ${dateFilterMode === 'exact' ? 'active' : ''}`}
                                            onClick={() => { setDateFilterMode('exact'); setDateFilterValue(''); }}
                                        >
                                            Exact Date
                                        </button>
                                        <button
                                            className={`date-mode-btn ${dateFilterMode === 'month' ? 'active' : ''}`}
                                            onClick={() => { setDateFilterMode('month'); setDateFilterValue(''); }}
                                        >
                                            Month
                                        </button>
                                        <button
                                            className={`date-mode-btn ${dateFilterMode === 'year' ? 'active' : ''}`}
                                            onClick={() => { setDateFilterMode('year'); setDateFilterValue(''); }}
                                        >
                                            Year
                                        </button>
                                    </div>

                                    <div className="date-filter-input">
                                        {dateFilterMode === 'exact' && (
                                            <Form.Control
                                                type="date"
                                                value={dateFilterValue}
                                                onChange={(e) => setDateFilterValue(e.target.value)}
                                            />
                                        )}
                                        {dateFilterMode === 'month' && (
                                            <Form.Control
                                                type="month"
                                                value={dateFilterValue}
                                                onChange={(e) => setDateFilterValue(e.target.value)}
                                            />
                                        )}
                                        {dateFilterMode === 'year' && (
                                            <Form.Control
                                                type="number"
                                                placeholder="e.g. 2025"
                                                min="2000"
                                                max="2100"
                                                value={dateFilterValue}
                                                onChange={(e) => setDateFilterValue(e.target.value)}
                                            />
                                        )}
                                    </div>

                                    <div className="date-filter-actions">
                                        <Button size="sm" variant="outline-secondary" onClick={clearDateFilter}>
                                            Clear
                                        </Button>
                                        <Button size="sm" variant="primary" onClick={applyDateFilter} disabled={!dateFilterValue}>
                                            Apply
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Add Case */}
                        <Button
                            style={{ background: '#000', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', whiteSpace: 'nowrap' }}
                            onClick={() => navigate('/add-case')}
                        >
                            + New Case
                        </Button>
                    </div>
                </div>

                {/* Active filter indicators — float right */}
                {(filteredCases !== null || dateFilterActive) && (
                    <div className="d-flex flex-wrap align-items-center justify-content-end mb-3 gap-2 search-results-badge">
                        {filteredCases !== null && (
                            <div className="d-flex align-items-center gap-1">
                                <span className="badge bg-primary">
                                    {displayCases.length} result{displayCases.length !== 1 ? 's' : ''}
                                </span>
                                <small className="text-muted">
                                    "{searchQuery}"
                                    {searchField && <> · <strong>{SEARCH_FIELDS.find(f => f.value === searchField)?.label}</strong></>}
                                </small>
                                <button className="icon-btn" title="Clear search" onClick={handleClearSearch} style={{ width: 22, height: 22 }}>
                                    <FiX size={12} />
                                </button>
                            </div>
                        )}
                        {dateFilterActive && (
                            <div className="d-flex align-items-center gap-1">
                                <span className="badge bg-warning" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#fff' }}>
                                    <FiCalendar size={11} />{getDateFilterLabel()}
                                </span>
                                <button className="icon-btn" title="Clear date filter" onClick={clearDateFilter} style={{ width: 22, height: 22 }}>
                                    <FiX size={12} />
                                </button>
                            </div>
                        )}
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
                                                        <td>
                                                            <span className="badge bg-warning text-dark fw-bold">{formatDate(c.next_date)}</span>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex gap-1">
                                                                <button
                                                                    className="icon-btn"
                                                                    title="View case"
                                                                    onClick={() => navigate(`/case/${c._id}`)}
                                                                >
                                                                    <FiEye size={14} />
                                                                </button>
                                                                <button
                                                                    className="icon-btn icon-btn-danger"
                                                                    title="Delete case"
                                                                    onClick={() => handleDeleteClick(c._id, c.case_title)}
                                                                >
                                                                    <FiTrash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="text-center py-4">
                                                        {(filteredCases !== null || dateFilterActive) ? 'No matching cases found.' : 'No cases found.'}
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
                                            {/* Header: Case number/year + status badge */}
                                            <div className="d-flex justify-content-between align-items-start mb-1">
                                                <h5 className="card-title fw-bold mb-0">
                                                    {c.case_number}/{c.year}
                                                </h5>
                                                <span className={`badge ${c.matter_disposed === 'pending' ? 'bg-success' : 'bg-secondary'}`}>
                                                    {c.matter_disposed === 'pending' ? 'Open' : c.matter_disposed}
                                                </span>
                                            </div>

                                            {/* Case title */}
                                            <h6 className="card-subtitle mb-3 text-muted">{c.case_title}</h6>

                                            {/* Contact */}
                                            <div className="mb-2">
                                                <div className="fw-bold mb-1">{c.contact_person_name}</div>
                                                <div className="d-flex align-items-center gap-2">
                                                    <a
                                                        href={`tel:${c.contact_person_phone}`}
                                                        className="icon-btn"
                                                        title={`Call ${c.contact_person_name}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                        style={{ textDecoration: 'none', width: 28, height: 28 }}
                                                    >
                                                        <FiPhone size={13} />
                                                    </a>
                                                    <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                                                        {c.contact_person_phone}
                                                    </span>
                                                </div>
                                            </div>

                                            <hr className="my-2" />

                                            {/* Footer: Next date inline + delete */}
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div className="d-flex align-items-center gap-2">
                                                    <small className="text-muted">Next Date:</small>
                                                    <span className="badge bg-warning fw-bold" style={{ color: '#fff' }}>
                                                        {formatDate(c.next_date)}
                                                    </span>
                                                </div>
                                                <button
                                                    className="icon-btn icon-btn-danger"
                                                    title="Delete case"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteClick(c._id, c.case_title);
                                                    }}
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                ))
                            ) : (
                                <div className="text-center py-4">
                                    {(filteredCases !== null || dateFilterActive) ? 'No matching cases found.' : 'No cases found.'}
                                </div>
                            )}
                        </Col>
                    </Row>
                )}
            </Container>

            {/* Delete Confirmation Modal */}
            <Modal show={!!deleteTarget} onHide={handleDeleteCancel} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete the case{' '}
                    <strong>"{deleteTarget?.title}"</strong>? This action cannot be undone.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleDeleteCancel} disabled={deleting}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeleteConfirm} disabled={deleting}>
                        {deleting ? <Spinner animation="border" size="sm" /> : 'Delete'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default Dashboard;

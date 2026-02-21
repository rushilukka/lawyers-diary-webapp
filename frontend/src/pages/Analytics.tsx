import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { casesApi, type Case } from '../api/cases';
import { FiBriefcase, FiCheckCircle, FiClock, FiCalendar, FiTrendingUp } from 'react-icons/fi';

const Analytics = () => {
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCases = async () => {
            try {
                const data = await casesApi.getAllCases();
                setCases(data);
            } catch (err: any) {
                setError('Failed to load analytics data.');
                if (err.response && err.response.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchCases();
    }, [navigate]);

    if (loading) {
        return (
            <div className="full-height-center" style={{ paddingTop: '4rem' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (error) {
        return (
            <Container className="mt-4">
                <div className="alert alert-danger">{error}</div>
            </Container>
        );
    }

    const total = cases.length;
    const open = cases.filter(c => c.matter_disposed === 'pending').length;
    const disposed = cases.filter(c => c.matter_disposed !== 'pending').length;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonth = cases.filter(c => {
        if (!c.next_date) return false;
        const d = new Date(c.next_date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    // Upcoming (next_date >= today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = cases.filter(c => {
        if (!c.next_date) return false;
        return new Date(c.next_date) >= today;
    }).length;

    // Month-wise breakdown (last 6 months)
    const monthLabels: string[] = [];
    const monthCounts: number[] = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - i, 1);
        const y = d.getFullYear();
        const m = d.getMonth();
        const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        monthLabels.push(label);
        const count = cases.filter(c => {
            if (!c.next_date) return false;
            const cd = new Date(c.next_date);
            return cd.getFullYear() === y && cd.getMonth() === m;
        }).length;
        monthCounts.push(count);
    }

    const maxCount = Math.max(...monthCounts, 1);

    const statCards = [
        {
            label: 'Total Cases',
            value: total,
            icon: <FiBriefcase size={28} />,
            color: 'rgba(255,255,255,0.15)',
            border: 'rgba(255,255,255,0.25)',
        },
        {
            label: 'Open Cases',
            value: open,
            icon: <FiClock size={28} />,
            color: 'rgba(40, 200, 120, 0.12)',
            border: 'rgba(40,200,120,0.35)',
        },
        {
            label: 'Disposed',
            value: disposed,
            icon: <FiCheckCircle size={28} />,
            color: 'rgba(150,150,255,0.12)',
            border: 'rgba(150,150,255,0.35)',
        },
        {
            label: 'Hearings This Month',
            value: thisMonth,
            icon: <FiCalendar size={28} />,
            color: 'rgba(255, 200, 40, 0.12)',
            border: 'rgba(255,200,40,0.35)',
        },
        {
            label: 'Upcoming Hearings',
            value: upcoming,
            icon: <FiTrendingUp size={28} />,
            color: 'rgba(255,120,80,0.12)',
            border: 'rgba(255,120,80,0.35)',
        },
    ];

    return (
        <Container className="mt-4 layout-container">
            <div className="d-flex align-items-center mb-4" style={{ gap: '10px' }}>
                <FiTrendingUp size={26} color="#fff" />
                <h2 className="mb-0">Analytics</h2>
            </div>

            {/* Stat Cards */}
            <Row className="g-3 mb-5">
                {statCards.map(card => (
                    <Col key={card.label} xs={6} md={4} lg>
                        <Card
                            className="h-100 text-white"
                            style={{
                                background: card.color,
                                border: `1px solid ${card.border}`,
                                borderRadius: '14px',
                                backdropFilter: 'blur(8px)',
                            }}
                        >
                            <Card.Body className="d-flex flex-column align-items-center justify-content-center py-4 gap-2">
                                <div style={{ opacity: 0.75 }}>{card.icon}</div>
                                <div style={{ fontSize: '2.4rem', fontWeight: 700, lineHeight: 1 }}>
                                    {card.value}
                                </div>
                                <div style={{ fontSize: '0.78rem', opacity: 0.7, textAlign: 'center', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                    {card.label}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Monthly Hearing Bar Chart */}
            <Card style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px' }}>
                <Card.Body>
                    <h5 className="mb-4" style={{ color: '#fff', fontWeight: 600 }}>
                        Hearings by Month <small style={{ fontSize: '0.8rem', opacity: 0.6 }}>(Next Date)</small>
                    </h5>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '160px' }}>
                        {monthLabels.map((label, i) => {
                            const pct = monthCounts[i] / maxCount;
                            const isCurrentMonth = i === 5;
                            return (
                                <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '6px' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#fff', opacity: 0.8, fontWeight: 600 }}>
                                        {monthCounts[i]}
                                    </span>
                                    <div
                                        style={{
                                            width: '100%',
                                            height: `${Math.max(pct * 110, monthCounts[i] === 0 ? 4 : 8)}px`,
                                            borderRadius: '6px 6px 2px 2px',
                                            background: isCurrentMonth
                                                ? 'rgba(255,200,40,0.85)'
                                                : 'rgba(255,255,255,0.25)',
                                            border: isCurrentMonth
                                                ? '1px solid rgba(255,200,40,0.6)'
                                                : '1px solid rgba(255,255,255,0.15)',
                                            transition: 'height 0.4s ease',
                                        }}
                                    />
                                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>
                                        {label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Analytics;

import { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { casesApi, type Case } from '../api/cases';
import {
    FiBriefcase, FiCheckCircle, FiClock,
    FiCalendar, FiTrendingUp, FiAlertCircle, FiPhone, FiEye,
} from 'react-icons/fi';

type SideTab = 'dashboard' | 'reply_pending' | 'disposed';

/* ── helpers ── */
const formatDate = (dateStr: string): string => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
};

/* ══════════════════════════════════════════
   SUB-PANELS
══════════════════════════════════════════ */

/* ─── Dashboard Sub-tab ─── */
const DashboardPanel = ({ cases }: { cases: Case[] }) => {
    const total = cases.length;
    const open = cases.filter(c => c.matter_disposed === 'pending').length;
    const disposed = cases.filter(c => c.matter_disposed !== 'pending').length;
    const replyPending = cases.filter(c => c.reply_pending).length;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonth = cases.filter(c => {
        if (!c.next_date) return false;
        const d = new Date(c.next_date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = cases.filter(c => c.next_date && new Date(c.next_date) >= today).length;

    const statCards = [
        { label: 'Total Cases', value: total, icon: <FiBriefcase size={26} />, color: 'rgba(255,255,255,0.1)', border: 'rgba(255,255,255,0.2)' },
        { label: 'Open Cases', value: open, icon: <FiClock size={26} />, color: 'rgba(40,200,120,0.1)', border: 'rgba(40,200,120,0.3)' },
        { label: 'Disposed', value: disposed, icon: <FiCheckCircle size={26} />, color: 'rgba(150,150,255,0.1)', border: 'rgba(150,150,255,0.3)' },
        { label: 'Reply Pending', value: replyPending, icon: <FiAlertCircle size={26} />, color: 'rgba(255,120,80,0.1)', border: 'rgba(255,120,80,0.3)' },
        { label: 'Hearings This Month', value: thisMonth, icon: <FiCalendar size={26} />, color: 'rgba(255,200,40,0.1)', border: 'rgba(255,200,40,0.3)' },
        { label: 'Upcoming Hearings', value: upcoming, icon: <FiTrendingUp size={26} />, color: 'rgba(100,180,255,0.1)', border: 'rgba(100,180,255,0.3)' },
    ];

    // Month-wise breakdown (last 6 months)
    const monthLabels: string[] = [];
    const monthCounts: number[] = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - i, 1);
        const y = d.getFullYear();
        const m = d.getMonth();
        monthLabels.push(d.toLocaleString('default', { month: 'short', year: '2-digit' }));
        monthCounts.push(
            cases.filter(c => {
                if (!c.next_date) return false;
                const cd = new Date(c.next_date);
                return cd.getFullYear() === y && cd.getMonth() === m;
            }).length
        );
    }
    const maxCount = Math.max(...monthCounts, 1);

    return (
        <>
            <Row className="g-3 mb-4">
                {statCards.map(card => (
                    <Col key={card.label} xs={6} xl={4}>
                        <Card
                            className="h-100 text-white analytics-stat-card"
                            style={{ background: card.color, border: `1px solid ${card.border}`, borderRadius: '12px' }}
                        >
                            <Card.Body className="d-flex flex-column align-items-center justify-content-center py-3 gap-1">
                                <div style={{ opacity: 0.7 }}>{card.icon}</div>
                                <div style={{ fontSize: '2.2rem', fontWeight: 700, lineHeight: 1.1 }}>{card.value}</div>
                                <div style={{ fontSize: '0.72rem', opacity: 0.65, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    {card.label}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Card style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                <Card.Body>
                    <h6 className="mb-3" style={{ color: '#fff', fontWeight: 600 }}>
                        Hearings by Month <small style={{ opacity: 0.55, fontSize: '0.75rem' }}>(Next Date)</small>
                    </h6>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '140px' }}>
                        {monthLabels.map((label, i) => {
                            const pct = monthCounts[i] / maxCount;
                            const isCurrent = i === 5;
                            return (
                                <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '5px' }}>
                                    <span style={{ fontSize: '0.72rem', color: '#fff', opacity: 0.8, fontWeight: 600 }}>{monthCounts[i]}</span>
                                    <div style={{
                                        width: '100%',
                                        height: `${Math.max(pct * 96, monthCounts[i] === 0 ? 3 : 6)}px`,
                                        borderRadius: '5px 5px 2px 2px',
                                        background: isCurrent ? 'rgba(255,200,40,0.85)' : 'rgba(255,255,255,0.22)',
                                        border: isCurrent ? '1px solid rgba(255,200,40,0.5)' : '1px solid rgba(255,255,255,0.12)',
                                        transition: 'height 0.4s ease',
                                    }} />
                                    <span style={{ fontSize: '0.66rem', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>{label}</span>
                                </div>
                            );
                        })}
                    </div>
                </Card.Body>
            </Card>
        </>
    );
};

/* ─── Case List Panel (shared for Pending / Disposed) ─── */
const CaseListPanel = ({
    cases,
    emptyMsg,
    accentColor,
    badgeLabel,
}: {
    cases: Case[];
    emptyMsg: string;
    accentColor: string;
    badgeLabel: (c: Case) => string;
}) => {
    const navigate = useNavigate();

    if (cases.length === 0) {
        return (
            <div className="text-center py-5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
                {emptyMsg}
            </div>
        );
    }

    return (
        <div className="d-flex flex-column gap-3">
            {cases.map(c => (
                <Card
                    key={c._id}
                    className="text-white analytics-case-card"
                    style={{
                        background: 'rgba(0,0,0,0.38)',
                        border: `1px solid ${accentColor}`,
                        borderRadius: '10px',
                        cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/case/${c._id}`)}
                >
                    <Card.Body className="py-3 px-3">
                        <div className="d-flex justify-content-between align-items-start gap-2">
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                                    <span style={{ fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                                        {c.case_number}/{c.year}
                                    </span>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        padding: '2px 8px',
                                        borderRadius: '20px',
                                        border: `1px solid ${accentColor}`,
                                        color: accentColor,
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {badgeLabel(c)}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.82rem', opacity: 0.75, marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {c.case_title}
                                </div>
                                <div className="d-flex align-items-center gap-3 flex-wrap" style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <FiPhone size={11} /> {c.contact_person_name}
                                    </span>
                                    {c.next_date && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <FiCalendar size={11} /> {formatDate(c.next_date)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                className="icon-btn"
                                title="View case"
                                style={{ flexShrink: 0 }}
                                onClick={e => { e.stopPropagation(); navigate(`/case/${c._id}`); }}
                            >
                                <FiEye size={13} />
                            </button>
                        </div>
                    </Card.Body>
                </Card>
            ))}
        </div>
    );
};

/* ══════════════════════════════════════════
   MAIN ANALYTICS PAGE
══════════════════════════════════════════ */
const Analytics = () => {
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<SideTab>('dashboard');
    const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
    const mobileDropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCases = async () => {
            try {
                const data = await casesApi.getAllCases();
                setCases(data);
            } catch (err: any) {
                setError('Failed to load analytics data.');
                if (err.response?.status === 401) navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchCases();
    }, [navigate]);

    // Close mobile dropdown on outside click
    useEffect(() => {
        const handleOutside = (e: MouseEvent) => {
            if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(e.target as Node)) {
                setMobileDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, []);

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

    const replyPendingCases = cases.filter(c => c.reply_pending);
    const disposedCases = cases.filter(c => c.matter_disposed !== 'pending');

    const sideTabs: { id: SideTab; label: string; icon: React.ReactNode; count?: number }[] = [
        { id: 'dashboard', label: 'Dashboard', icon: <FiTrendingUp size={16} /> },
        { id: 'reply_pending', label: 'Reply Pending', icon: <FiAlertCircle size={16} />, count: replyPendingCases.length },
        { id: 'disposed', label: 'Dispose Matter', icon: <FiCheckCircle size={16} />, count: disposedCases.length },
    ];

    return (
        <div className="analytics-page">
            <div className="analytics-layout">
                {/* ── Left Sidebar ── */}
                <aside className="analytics-sidebar">
                    <div className="analytics-sidebar-header">Analytics</div>
                    {/* Mobile custom dropdown */}
                    <div className="analytics-mobile-dropdown" ref={mobileDropdownRef}>
                        <button
                            className="analytics-mobile-dropdown-btn"
                            onClick={() => setMobileDropdownOpen(prev => !prev)}
                            aria-expanded={mobileDropdownOpen}
                        >
                            <span className="analytics-mobile-dropdown-icon">
                                {sideTabs.find(t => t.id === activeTab)?.icon}
                            </span>
                            <span className="analytics-mobile-dropdown-label">
                                {sideTabs.find(t => t.id === activeTab)?.label}
                                {(() => { const c = sideTabs.find(t => t.id === activeTab)?.count; return c !== undefined ? ` (${c})` : ''; })()}
                            </span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                                fill="currentColor" viewBox="0 0 16 16"
                                style={{ transition: 'transform 0.2s', transform: mobileDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', opacity: 0.6, flexShrink: 0 }}
                            >
                                <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708" />
                            </svg>
                        </button>

                        {mobileDropdownOpen && (
                            <div className="analytics-mobile-dropdown-menu">
                                {sideTabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        className={`analytics-mobile-dropdown-item ${activeTab === tab.id ? 'active' : ''}`}
                                        onClick={() => { setActiveTab(tab.id); setMobileDropdownOpen(false); }}
                                    >
                                        <span style={{ display: 'flex', alignItems: 'center' }}>{tab.icon}</span>
                                        <span style={{ flex: 1 }}>{tab.label}</span>
                                        {tab.count !== undefined && (
                                            <span className="analytics-sidebar-tab-badge">{tab.count}</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Desktop sidebar nav */}
                    <nav className="analytics-sidebar-nav">
                        {sideTabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`analytics-sidebar-tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <span className="analytics-sidebar-tab-icon">{tab.icon}</span>
                                <span className="analytics-sidebar-tab-label">{tab.label}</span>
                                {tab.count !== undefined && (
                                    <span className="analytics-sidebar-tab-badge">{tab.count}</span>
                                )}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* ── Main Content ── */}
                <main className="analytics-content">
                    {activeTab === 'dashboard' && <DashboardPanel cases={cases} />}

                    {activeTab === 'reply_pending' && (
                        <>
                            <div className="analytics-content-header">
                                <FiAlertCircle size={20} style={{ color: 'rgba(255,120,80,0.9)' }} />
                                <h5 className="mb-0">Reply Pending</h5>
                                <span className="analytics-count-badge" style={{ background: 'rgba(255,120,80,0.2)', border: '1px solid rgba(255,120,80,0.4)', color: 'rgba(255,140,100,1)' }}>
                                    {replyPendingCases.length}
                                </span>
                            </div>
                            <CaseListPanel
                                cases={replyPendingCases}
                                emptyMsg="No cases with reply pending."
                                accentColor="rgba(255,120,80,0.45)"
                                badgeLabel={() => 'Reply Pending'}
                            />
                        </>
                    )}

                    {activeTab === 'disposed' && (
                        <>
                            <div className="analytics-content-header">
                                <FiCheckCircle size={20} style={{ color: 'rgba(150,150,255,0.9)' }} />
                                <h5 className="mb-0">Disposed Matters</h5>
                                <span className="analytics-count-badge" style={{ background: 'rgba(150,150,255,0.15)', border: '1px solid rgba(150,150,255,0.4)', color: 'rgba(180,180,255,1)' }}>
                                    {disposedCases.length}
                                </span>
                            </div>
                            <CaseListPanel
                                cases={disposedCases}
                                emptyMsg="No disposed matters yet."
                                accentColor="rgba(150,150,255,0.4)"
                                badgeLabel={c => c.matter_disposed}
                            />
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Analytics;

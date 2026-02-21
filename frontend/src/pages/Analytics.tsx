import { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { casesApi, type Case } from '../api/cases';
import {
    FiBriefcase, FiCheckCircle, FiClock,
    FiCalendar, FiTrendingUp, FiAlertCircle, FiPhone, FiEye, FiX,
} from 'react-icons/fi';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts';

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

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* ── Recharts dark tooltip ── */
const DarkTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: 'rgba(12,12,12,0.95)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '8px', padding: '8px 14px', fontSize: '0.82rem', color: '#fff',
        }}>
            <div style={{ opacity: 0.6, marginBottom: 2 }}>{label}</div>
            <div style={{ fontWeight: 700 }}>{payload[0].value} case{payload[0].value !== 1 ? 's' : ''}</div>
        </div>
    );
};

/* ══════════════════════════════════════════
   DASHBOARD PANEL
══════════════════════════════════════════ */
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

    // last 6 months bar data
    const barData = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(currentYear, currentMonth - (5 - i), 1);
        const y = d.getFullYear(), m = d.getMonth();
        return {
            month: MONTH_NAMES[m] + ' \'' + String(y).slice(-2),
            count: cases.filter(c => {
                if (!c.next_date) return false;
                const cd = new Date(c.next_date);
                return cd.getFullYear() === y && cd.getMonth() === m;
            }).length,
            isCurrent: i === 5,
        };
    });

    return (
        <>
            <Row className="g-3 mb-4">
                {statCards.map(card => (
                    <Col key={card.label} xs={6} xl={4}>
                        <Card className="h-100 text-white analytics-stat-card"
                            style={{ background: card.color, border: `1px solid ${card.border}`, borderRadius: '12px' }}>
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
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={barData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                            <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                            <Bar dataKey="count" radius={[5, 5, 2, 2]}>
                                {barData.map((d, i) => (
                                    <Cell key={i} fill={d.isCurrent ? 'rgba(255,200,40,0.85)' : 'rgba(255,255,255,0.22)'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Card.Body>
            </Card>
        </>
    );
};

/* ══════════════════════════════════════════
   REPLY PENDING PANEL
══════════════════════════════════════════ */
const PENDING_COLORS = [
    'rgba(255,120,80,0.85)', 'rgba(255,160,60,0.85)', 'rgba(255,200,40,0.85)',
    'rgba(255,90,130,0.85)', 'rgba(200,100,255,0.85)', 'rgba(100,180,255,0.85)',
];

const ReplyPendingPanel = ({ cases }: { cases: Case[] }) => {
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

    // Group by month of next_date
    const monthMap = new Map<string, Case[]>();
    cases.forEach(c => {
        if (!c.next_date) {
            const k = 'No Date';
            monthMap.set(k, [...(monthMap.get(k) || []), c]);
        } else {
            const d = new Date(c.next_date);
            const k = MONTH_NAMES[d.getMonth()] + ' \'' + String(d.getFullYear()).slice(-2);
            monthMap.set(k, [...(monthMap.get(k) || []), c]);
        }
    });

    const barData = Array.from(monthMap.entries())
        .map(([month, list]) => ({ month, count: list.length }))
        .sort((a, b) => a.month.localeCompare(b.month));

    const displayCases = selectedMonth
        ? (monthMap.get(selectedMonth) || [])
        : cases;

    const handleBarClick = (data: any) => {
        setSelectedMonth(prev => prev === data.month ? null : data.month);
    };

    if (cases.length === 0) {
        return (
            <div className="text-center py-5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
                No cases with reply pending.
            </div>
        );
    }

    return (
        <>
            {/* Chart */}
            <Card className="mb-4" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,120,80,0.2)', borderRadius: '12px' }}>
                <Card.Body>
                    <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
                        <h6 className="mb-0" style={{ color: '#fff', fontWeight: 600 }}>
                            Reply Pending by Month
                            <small style={{ opacity: 0.5, fontSize: '0.73rem', marginLeft: 8 }}>click a bar to filter</small>
                        </h6>
                        {selectedMonth && (
                            <button className="icon-btn" style={{ width: 'auto', padding: '3px 10px', fontSize: '0.75rem', gap: 4, display: 'flex', alignItems: 'center' }}
                                onClick={() => setSelectedMonth(null)}>
                                <FiX size={11} /> Clear filter
                            </button>
                        )}
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={barData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                            onClick={(e: any) => e?.activePayload && handleBarClick(e.activePayload[0].payload)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                            <Bar dataKey="count" radius={[5, 5, 2, 2]} style={{ cursor: 'pointer' }}>
                                {barData.map((d, i) => (
                                    <Cell
                                        key={i}
                                        fill={selectedMonth === d.month ? 'rgba(255,200,40,0.9)' : PENDING_COLORS[i % PENDING_COLORS.length]}
                                        opacity={selectedMonth && selectedMonth !== d.month ? 0.35 : 1}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Card.Body>
            </Card>

            {/* Filtered case list */}
            <div className="d-flex align-items-center gap-2 mb-3">
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                    {selectedMonth ? `Showing: ${selectedMonth}` : 'All months'}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '1px 8px', borderRadius: '12px', background: 'rgba(255,120,80,0.2)', color: 'rgba(255,140,100,1)', border: '1px solid rgba(255,120,80,0.35)' }}>
                    {displayCases.length}
                </span>
            </div>
            <CaseListPanel
                cases={displayCases}
                accentColor="rgba(255,120,80,0.45)"
                badgeLabel={() => 'Reply Pending'}
                emptyMsg="No cases in this selection."
            />
        </>
    );
};

/* ══════════════════════════════════════════
   DISPOSED MATTER PANEL
══════════════════════════════════════════ */
const DISPOSED_COLORS = [
    'rgba(150,150,255,0.85)', 'rgba(100,200,180,0.85)', 'rgba(255,200,40,0.85)',
    'rgba(255,120,80,0.85)', 'rgba(100,180,255,0.85)', 'rgba(200,100,255,0.85)',
];

const PieTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: 'rgba(12,12,12,0.95)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '8px', padding: '8px 14px', fontSize: '0.82rem', color: '#fff',
        }}>
            <div style={{ opacity: 0.6, marginBottom: 2 }}>{payload[0].name}</div>
            <div style={{ fontWeight: 700 }}>{payload[0].value} case{payload[0].value !== 1 ? 's' : ''}</div>
        </div>
    );
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.06) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

const DisposedPanel = ({ cases }: { cases: Case[] }) => {
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

    // Group by matter_disposed value
    const statusMap = new Map<string, Case[]>();
    cases.forEach(c => {
        const k = c.matter_disposed || 'Unknown';
        statusMap.set(k, [...(statusMap.get(k) || []), c]);
    });

    const pieData = Array.from(statusMap.entries()).map(([name, list]) => ({ name, value: list.length }));

    const handlePieClick = (data: any) => {
        setSelectedStatus(prev => prev === data.name ? null : data.name);
    };

    const displayCases = selectedStatus
        ? (statusMap.get(selectedStatus) || [])
        : cases;

    if (cases.length === 0) {
        return (
            <div className="text-center py-5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📂</div>
                No disposed matters yet.
            </div>
        );
    }

    return (
        <>
            {/* Pie Chart */}
            <Card className="mb-4" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(150,150,255,0.2)', borderRadius: '12px' }}>
                <Card.Body>
                    <div className="d-flex align-items-center justify-content-between mb-1 flex-wrap gap-2">
                        <h6 className="mb-0" style={{ color: '#fff', fontWeight: 600 }}>
                            Breakdown by Status
                            <small style={{ opacity: 0.5, fontSize: '0.73rem', marginLeft: 8 }}>click a slice to filter</small>
                        </h6>
                        {selectedStatus && (
                            <button className="icon-btn" style={{ width: 'auto', padding: '3px 10px', fontSize: '0.75rem', gap: 4, display: 'flex', alignItems: 'center' }}
                                onClick={() => setSelectedStatus(null)}>
                                <FiX size={11} /> Clear filter
                            </button>
                        )}
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                outerRadius={90}
                                innerRadius={44}
                                dataKey="value"
                                labelLine={false}
                                label={renderCustomLabel}
                                onClick={handlePieClick}
                                style={{ cursor: 'pointer' }}
                            >
                                {pieData.map((_, i) => (
                                    <Cell
                                        key={i}
                                        fill={DISPOSED_COLORS[i % DISPOSED_COLORS.length]}
                                        opacity={selectedStatus && selectedStatus !== pieData[i].name ? 0.3 : 1}
                                        stroke={selectedStatus === pieData[i].name ? '#fff' : 'transparent'}
                                        strokeWidth={2}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<PieTooltip />} />
                            <Legend
                                iconType="circle"
                                iconSize={10}
                                formatter={(value) => (
                                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                                        {value} ({statusMap.get(value)?.length ?? 0})
                                    </span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </Card.Body>
            </Card>

            {/* Filtered case list */}
            <div className="d-flex align-items-center gap-2 mb-3">
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                    {selectedStatus ? `Showing: "${selectedStatus}"` : 'All statuses'}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '1px 8px', borderRadius: '12px', background: 'rgba(150,150,255,0.15)', color: 'rgba(180,180,255,1)', border: '1px solid rgba(150,150,255,0.35)' }}>
                    {displayCases.length}
                </span>
            </div>
            <CaseListPanel
                cases={displayCases}
                accentColor="rgba(150,150,255,0.4)"
                badgeLabel={c => c.matter_disposed}
                emptyMsg="No cases in this selection."
            />
        </>
    );
};

/* ══════════════════════════════════════════
   SHARED CASE LIST
══════════════════════════════════════════ */
const CaseListPanel = ({
    cases, emptyMsg, accentColor, badgeLabel,
}: {
    cases: Case[];
    emptyMsg: string;
    accentColor: string;
    badgeLabel: (c: Case) => string;
}) => {
    const navigate = useNavigate();

    if (cases.length === 0) {
        return (
            <div className="text-center py-4" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem' }}>
                {emptyMsg}
            </div>
        );
    }

    return (
        <div className="d-flex flex-column gap-3">
            {cases.map(c => (
                <Card key={c._id} className="text-white analytics-case-card"
                    style={{ background: 'rgba(0,0,0,0.38)', border: `1px solid ${accentColor}`, borderRadius: '10px', cursor: 'pointer' }}
                    onClick={() => navigate(`/case/${c._id}`)}>
                    <Card.Body className="py-3 px-3">
                        <div className="d-flex justify-content-between align-items-start gap-2">
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                                    <span style={{ fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                                        {c.case_number}/{c.year}
                                    </span>
                                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '20px', border: `1px solid ${accentColor}`, color: accentColor, whiteSpace: 'nowrap' }}>
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
                            <button className="icon-btn" title="View case" style={{ flexShrink: 0 }}
                                onClick={e => { e.stopPropagation(); navigate(`/case/${c._id}`); }}>
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
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16"
                                style={{ transition: 'transform 0.2s', transform: mobileDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', opacity: 0.6, flexShrink: 0 }}>
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
                            <ReplyPendingPanel cases={replyPendingCases} />
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
                            <DisposedPanel cases={disposedCases} />
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Analytics;

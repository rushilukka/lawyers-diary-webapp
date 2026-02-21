import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { casesApi } from '../api/cases';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiUnlock } from 'react-icons/fi';

const ViewCase = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();

    const getTodayString = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const [formData, setFormData] = useState({
        case_number: '',
        year: '',
        case_title: '',
        next_date: '',
        reply_pending: 'No',
        admit: 'No',
        matter_disposed: 'pending',
        contact_person_name: '',
        contact_person_phone: '',
        notes: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [serverError, setServerError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        const fetchCase = async () => {
            try {
                if (!id) return;
                const data = await casesApi.getCaseById(id);
                const nextDate = data.next_date
                    ? new Date(data.next_date).toISOString().split('T')[0]
                    : '';
                setFormData({
                    case_number: data.case_number || '',
                    year: String(data.year) || '',
                    case_title: data.case_title || '',
                    next_date: nextDate,
                    reply_pending: data.reply_pending ? 'Yes' : 'No',
                    admit: data.admit ? 'Yes' : 'No',
                    matter_disposed: data.matter_disposed || 'pending',
                    contact_person_name: data.contact_person_name || '',
                    contact_person_phone: data.contact_person_phone || '',
                    notes: data.notes || ''
                });
            } catch (err: any) {
                setServerError('Failed to load case details.');
                if (err.response && err.response.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchCase();
    }, [id, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'contact_person_phone') {
            const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, [name]: digitsOnly }));
            if (errors.contact_person_phone) setErrors(prev => ({ ...prev, contact_person_phone: '' }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validate = (): Record<string, string> => {
        const errs: Record<string, string> = {};

        if (!formData.case_title) {
            errs.case_title = 'Case title is required.';
        } else if (formData.case_title.length > 500) {
            errs.case_title = 'Case title must be max 500 characters.';
        }

        if (formData.next_date) {
            const selected = new Date(formData.next_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selected < today) {
                errs.next_date = 'Next date must be today or a future date.';
            }
        }

        if (!formData.contact_person_name) {
            errs.contact_person_name = 'Contact person name is required.';
        } else if (formData.contact_person_name.length > 500) {
            errs.contact_person_name = 'Contact person name must be max 500 characters.';
        }

        if (!formData.contact_person_phone) {
            errs.contact_person_phone = 'Contact person phone is required.';
        } else if (formData.contact_person_phone.length !== 10) {
            errs.contact_person_phone = 'Phone number must be exactly 10 digits.';
        }

        return errs;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError(null);
        setSuccessMsg(null);

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setErrors({});
        setSaving(true);

        try {
            const payload = {
                case_title: formData.case_title,
                year: parseInt(formData.year),
                next_date: formData.next_date || null,
                reply_pending: formData.reply_pending === 'Yes',
                admit: formData.admit === 'Yes',
                matter_disposed: formData.matter_disposed,
                contact_person_name: formData.contact_person_name,
                contact_person_phone: formData.contact_person_phone,
                notes: formData.notes || null,
            };

            await casesApi.updateCase(id!, payload);
            setSuccessMsg('Case updated successfully!');
            setEditMode(false);
        } catch (err: any) {
            console.error(err);
            setServerError(err.response?.data?.message || 'Failed to update case. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const yearOptions = [];
    for (let y = currentYear; y >= currentYear - 10; y--) {
        yearOptions.push(y);
    }

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    return (
        <Container className="add-case-container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>
                    {editMode ? 'Edit Case' : 'Case Details'}
                </h2>
                <div className="d-flex gap-2">
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => navigate('/dashboard')}
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                        <FiArrowLeft size={15} /> Back
                    </Button>
                    {!editMode && (
                        <Button
                            size="sm"
                            style={{ background: '#000', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}
                            onClick={() => setEditMode(true)}
                        >
                            <FiUnlock size={14} /> Unlock to Edit
                        </Button>
                    )}
                </div>
            </div>

            {serverError && <Alert variant="danger">{serverError}</Alert>}
            {successMsg && <Alert variant="success">{successMsg}</Alert>}

            <Form onSubmit={handleSubmit} noValidate>
                {/* Case Number + Year */}
                <Row>
                    <Col md={8}>
                        <Form.Group className="mb-3" controlId="case_number">
                            <Form.Label>Case Number</Form.Label>
                            <Form.Control
                                type="text"
                                name="case_number"
                                value={formData.case_number}
                                disabled
                                className="add-case-input"
                            />
                            <Form.Text className="text-muted">Case number cannot be changed.</Form.Text>
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group className="mb-3" controlId="year">
                            <Form.Label>Year</Form.Label>
                            <Form.Select
                                name="year"
                                value={formData.year}
                                onChange={handleChange}
                                disabled={!editMode}
                                className="add-case-input"
                            >
                                {yearOptions.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>

                {/* Case Title */}
                <Form.Group className="mb-3" controlId="case_title">
                    <Form.Label>Case Title</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Case Title"
                        name="case_title"
                        value={formData.case_title}
                        onChange={handleChange}
                        maxLength={500}
                        disabled={!editMode}
                        isInvalid={!!errors.case_title}
                        className="add-case-input"
                    />
                    <Form.Control.Feedback type="invalid">{errors.case_title}</Form.Control.Feedback>
                </Form.Group>

                {/* Next Date */}
                <Form.Group className="mb-3" controlId="next_date">
                    <Form.Label>Next Date</Form.Label>
                    <Form.Control
                        type="date"
                        name="next_date"
                        value={formData.next_date}
                        onChange={handleChange}
                        min={getTodayString()}
                        disabled={!editMode}
                        isInvalid={!!errors.next_date}
                        className="add-case-input"
                    />
                    <Form.Control.Feedback type="invalid">{errors.next_date}</Form.Control.Feedback>
                </Form.Group>

                {/* Reply Pending */}
                <Form.Group className="mb-3">
                    <Form.Label className="d-block">Reply Pending</Form.Label>
                    <div className="d-flex gap-4">
                        <Form.Check
                            inline label="Yes" name="reply_pending" type="radio"
                            id="reply-yes" value="Yes"
                            checked={formData.reply_pending === 'Yes'}
                            onChange={handleRadioChange} disabled={!editMode}
                        />
                        <Form.Check
                            inline label="No" name="reply_pending" type="radio"
                            id="reply-no" value="No"
                            checked={formData.reply_pending === 'No'}
                            onChange={handleRadioChange} disabled={!editMode}
                        />
                    </div>
                </Form.Group>

                {/* Admit */}
                <Form.Group className="mb-3">
                    <Form.Label className="d-block">Admit</Form.Label>
                    <div className="d-flex gap-4">
                        <Form.Check
                            inline label="Yes" name="admit" type="radio"
                            id="admit-yes" value="Yes"
                            checked={formData.admit === 'Yes'}
                            onChange={handleRadioChange} disabled={!editMode}
                        />
                        <Form.Check
                            inline label="No" name="admit" type="radio"
                            id="admit-no" value="No"
                            checked={formData.admit === 'No'}
                            onChange={handleRadioChange} disabled={!editMode}
                        />
                    </div>
                </Form.Group>

                {/* Matter Disposed */}
                <Form.Group className="mb-3" controlId="matter_disposed">
                    <Form.Label>Matter Disposed</Form.Label>
                    <Form.Select
                        name="matter_disposed"
                        value={formData.matter_disposed}
                        onChange={handleChange}
                        disabled={!editMode}
                        className="add-case-input"
                    >
                        <option value="pending">Pending</option>
                        <option value="win">Win</option>
                        <option value="lost">Lost</option>
                        <option value="not_prejudicial">Not Prejudicial</option>
                    </Form.Select>
                </Form.Group>

                {/* Contact Person Name */}
                <Form.Group className="mb-3" controlId="contact_person_name">
                    <Form.Label>Contact Person Name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Contact Person Name"
                        name="contact_person_name"
                        value={formData.contact_person_name}
                        onChange={handleChange}
                        maxLength={500}
                        disabled={!editMode}
                        isInvalid={!!errors.contact_person_name}
                        className="add-case-input"
                    />
                    <Form.Control.Feedback type="invalid">{errors.contact_person_name}</Form.Control.Feedback>
                </Form.Group>

                {/* Contact Person Phone */}
                <Form.Group className="mb-3" controlId="contact_person_phone">
                    <Form.Label>Contact Person Phone Number</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Contact Person Phone Number"
                        name="contact_person_phone"
                        value={formData.contact_person_phone}
                        onChange={handleChange}
                        disabled={!editMode}
                        isInvalid={!!errors.contact_person_phone}
                        className="add-case-input"
                    />
                    <div className="d-flex justify-content-between">
                        <Form.Control.Feedback type="invalid">{errors.contact_person_phone}</Form.Control.Feedback>
                        <Form.Text className="text-muted ms-auto">{formData.contact_person_phone.length}/10</Form.Text>
                    </div>
                </Form.Group>

                {/* Notes */}
                <Form.Group className="mb-3" controlId="notes">
                    <Form.Label>Notes</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Notes (max 500 chars)"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        maxLength={500}
                        disabled={!editMode}
                        className="add-case-input"
                    />
                    <Form.Text className="text-muted d-block text-end">{formData.notes.length}/500</Form.Text>
                </Form.Group>

                {editMode && (
                    <div className="d-flex gap-2">
                        <Button
                            type="submit"
                            className="flex-grow-1"
                            style={{ background: '#000', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', fontWeight: 500 }}
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button
                            variant="outline-secondary"
                            onClick={() => setEditMode(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                )}
            </Form>
        </Container>
    );
};

export default ViewCase;

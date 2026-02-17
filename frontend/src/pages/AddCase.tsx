import React, { useState } from 'react';
import { Container, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { casesApi } from '../api/cases';
import { useNavigate } from 'react-router-dom';

const AddCase = () => {
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();

    const getTodayString = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const [formData, setFormData] = useState({
        case_number: '',
        year: currentYear.toString(),
        case_title: '',
        next_date: getTodayString(),
        reply_pending: 'Yes',
        admit: 'No',
        matter_disposed: 'pending',
        contact_person_name: '',
        contact_person_phone: '',
        notes: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [serverError, setServerError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        // For case_number: only allow digits, max 5
        if (name === 'case_number') {
            const digitsOnly = value.replace(/\D/g, '').slice(0, 5);
            setFormData(prev => ({ ...prev, [name]: digitsOnly }));
            if (errors.case_number) setErrors(prev => ({ ...prev, case_number: '' }));
            return;
        }

        // For contact_person_phone: only allow digits, max 10
        if (name === 'contact_person_phone') {
            const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, [name]: digitsOnly }));
            if (errors.contact_person_phone) setErrors(prev => ({ ...prev, contact_person_phone: '' }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear field error on change
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validate = (): Record<string, string> => {
        const errs: Record<string, string> = {};

        // Case number: required, max 5 digits
        if (!formData.case_number) {
            errs.case_number = 'Case number is required.';
        } else if (formData.case_number.length > 5) {
            errs.case_number = 'Case number must be max 5 digits.';
        }

        // Case title: required, max 500
        if (!formData.case_title) {
            errs.case_title = 'Case title is required.';
        } else if (formData.case_title.length > 500) {
            errs.case_title = 'Case title must be max 500 characters.';
        }

        // Next date: must be >= today
        if (formData.next_date) {
            const selected = new Date(formData.next_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selected < today) {
                errs.next_date = 'Next date must be today or a future date.';
            }
        }

        // Contact person name: required, max 500
        if (!formData.contact_person_name) {
            errs.contact_person_name = 'Contact person name is required.';
        } else if (formData.contact_person_name.length > 500) {
            errs.contact_person_name = 'Contact person name must be max 500 characters.';
        }

        // Contact person phone: required, exactly 10 digits
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

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setErrors({});
        setLoading(true);

        try {
            const payload = {
                case_number: formData.case_number,
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

            await casesApi.createCase(payload);
            navigate('/dashboard');
        } catch (err: any) {
            console.error(err);
            setServerError(err.response?.data?.message || 'Failed to add case. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Generate year options (current year + 5 years back)
    const yearOptions = [];
    for (let y = currentYear; y >= currentYear - 5; y--) {
        yearOptions.push(y);
    }

    return (
        <Container className="add-case-container py-4">
            <h2 className="mb-4" style={{ color: 'var(--bs-brown-dark)' }}>Add New Case</h2>

            {serverError && <Alert variant="danger">{serverError}</Alert>}

            <Form onSubmit={handleSubmit} noValidate>
                {/* Case Number + Year */}
                <Row>
                    <Col md={8}>
                        <Form.Group className="mb-3" controlId="case_number">
                            <Form.Label>Case Number</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Case Number"
                                name="case_number"
                                value={formData.case_number}
                                onChange={handleChange}
                                isInvalid={!!errors.case_number}
                                className="add-case-input"
                            />
                            <div className="d-flex justify-content-between">
                                <Form.Control.Feedback type="invalid">{errors.case_number}</Form.Control.Feedback>
                                <Form.Text className="text-muted ms-auto">{formData.case_number.length}/5</Form.Text>
                            </div>
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group className="mb-3" controlId="year">
                            <Form.Label>Year</Form.Label>
                            <Form.Select
                                name="year"
                                value={formData.year}
                                onChange={handleChange}
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
                            inline
                            label="Yes"
                            name="reply_pending"
                            type="radio"
                            id="reply-yes"
                            value="Yes"
                            checked={formData.reply_pending === 'Yes'}
                            onChange={handleRadioChange}
                        />
                        <Form.Check
                            inline
                            label="No"
                            name="reply_pending"
                            type="radio"
                            id="reply-no"
                            value="No"
                            checked={formData.reply_pending === 'No'}
                            onChange={handleRadioChange}
                        />
                    </div>
                </Form.Group>

                {/* Admit */}
                <Form.Group className="mb-3">
                    <Form.Label className="d-block">Admit</Form.Label>
                    <div className="d-flex gap-4">
                        <Form.Check
                            inline
                            label="Yes"
                            name="admit"
                            type="radio"
                            id="admit-yes"
                            value="Yes"
                            checked={formData.admit === 'Yes'}
                            onChange={handleRadioChange}
                        />
                        <Form.Check
                            inline
                            label="No"
                            name="admit"
                            type="radio"
                            id="admit-no"
                            value="No"
                            checked={formData.admit === 'No'}
                            onChange={handleRadioChange}
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
                        className="add-case-input"
                    />
                    <Form.Text className="text-muted d-block text-end">{formData.notes.length}/500</Form.Text>
                </Form.Group>

                <Button
                    type="submit"
                    className="w-100 mt-2"
                    style={{ backgroundColor: 'var(--bs-yellow-accent)', color: 'var(--bs-brown-dark)', border: 'none', fontWeight: 600 }}
                    disabled={loading}
                >
                    {loading ? 'Adding...' : 'Add Case'}
                </Button>
            </Form>
        </Container>
    );
};

export default AddCase;

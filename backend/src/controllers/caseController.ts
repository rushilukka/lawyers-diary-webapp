import { Response } from 'express';
import Case from '../models/Case';
// import { AuthRequest } from '../middleware/authMiddleware'; // Assuming AuthRequest is exported

// @desc    Get all cases for logged in lawyer
// @route   GET /api/cases
// @access  Private
const getCases = async (req: any, res: Response) => {
    try {
        const cases = await Case.find({ lawyer_id: req.user._id, is_deleted: { $ne: true } });
        res.json(cases);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single case by ID
// @route   GET /api/cases/:id
// @access  Private
const getCaseById = async (req: any, res: Response) => {
    try {
        const caseItem = await Case.findOne({
            _id: req.params.id,
            lawyer_id: req.user._id
        });

        if (caseItem) {
            res.json(caseItem);
        } else {
            res.status(404).json({ message: 'Case not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new case
// @route   POST /api/cases
// @access  Private
const createCase = async (req: any, res: Response) => {
    try {
        const {
            case_number,
            case_title,
            year,
            next_date,
            reply_pending,
            admit,
            matter_disposed,
            opinion_given,
            contact_person_name,
            contact_person_phone,
            notes,
        } = req.body;

        // --- Server-side validation ---
        const errors: string[] = [];

        // case_number: required, exactly 5 digits
        if (!case_number) {
            errors.push('Case number is required.');
        } else if (!/^\d{5}$/.test(case_number)) {
            errors.push('Case number must be exactly 5 digits.');
        }

        // case_title: required, max 500 chars
        if (!case_title) {
            errors.push('Case title is required.');
        } else if (case_title.length > 500) {
            errors.push('Case title must be max 500 characters.');
        }

        // year: required, exactly 4 digits
        if (!year || !/^\d{4}$/.test(String(year))) {
            errors.push('Year is required and must be exactly 4 digits.');
        }

        // next_date: if provided, must be today or in the future
        if (next_date) {
            const selectedDate = new Date(next_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (isNaN(selectedDate.getTime())) {
                errors.push('Next date must be a valid date.');
            } else if (selectedDate < today) {
                errors.push('Next date must be today or a future date.');
            }
        }

        // contact_person_name: required, max 500 chars
        if (!contact_person_name) {
            errors.push('Contact person name is required.');
        } else if (contact_person_name.length > 500) {
            errors.push('Contact person name must be max 500 characters.');
        }

        // contact_person_phone: required, exactly 10 digits
        if (!contact_person_phone) {
            errors.push('Contact person phone is required.');
        } else if (!/^\d{10}$/.test(contact_person_phone)) {
            errors.push('Contact person phone must be exactly 10 digits.');
        }

        // notes: optional, max 500 chars
        if (notes && notes.length > 500) {
            errors.push('Notes must be max 500 characters.');
        }

        // matter_disposed: must be one of the enum values
        const validDispositions = ['pending', 'win', 'lost', 'not_prejudicial'];
        if (matter_disposed && !validDispositions.includes(matter_disposed)) {
            errors.push('Matter disposed must be one of: pending, win, lost, not_prejudicial.');
        }

        if (errors.length > 0) {
            return res.status(400).json({ message: errors.join(' ') });
        }
        // Check for duplicate case_number
        const existing = await Case.findOne({ case_number });
        if (existing) {
            return res.status(400).json({ message: `Case number ${case_number} already exists.` });
        }
        // --- End validation ---

        const caseItem = new Case({
            lawyer_id: req.user._id,
            case_number,
            case_title,
            year: Number(year),
            next_date: next_date ? new Date(next_date) : null,
            reply_pending: reply_pending ?? false,
            admit: admit ?? false,
            matter_disposed: matter_disposed || 'pending',
            opinion_given: opinion_given ?? null,
            contact_person_name,
            contact_person_phone,
            notes: notes || null,
        });

        const createdCase = await caseItem.save();
        res.status(201).json(createdCase);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a case
// @route   PUT /api/cases/:id
// @access  Private
const updateCase = async (req: any, res: Response) => {
    try {
        const caseItem = await Case.findOne({
            _id: req.params.id,
            lawyer_id: req.user._id
        });

        if (!caseItem) {
            return res.status(404).json({ message: 'Case not found' });
        }

        // case_number and year are immutable — they form the compound unique key
        if (req.body.case_number !== undefined && req.body.case_number !== caseItem.case_number) {
            return res.status(400).json({ message: 'Case number cannot be changed.' });
        }
        if (req.body.year !== undefined && Number(req.body.year) !== caseItem.year) {
            return res.status(400).json({ message: 'Year cannot be changed.' });
        }

        const {
            case_title,
            year,
            next_date,
            reply_pending,
            admit,
            matter_disposed,
            opinion_given,
            contact_person_name,
            contact_person_phone,
            notes,
        } = req.body;

        // --- Server-side validation ---
        const errors: string[] = [];

        if (case_title !== undefined) {
            if (!case_title) {
                errors.push('Case title is required.');
            } else if (case_title.length > 500) {
                errors.push('Case title must be max 500 characters.');
            }
        }

        if (year !== undefined && !Number.isInteger(Number(year))) {
            errors.push('Year must be a valid integer.');
        }

        if (next_date) {
            const selectedDate = new Date(next_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (isNaN(selectedDate.getTime())) {
                errors.push('Next date must be a valid date.');
            } else if (selectedDate < today) {
                errors.push('Next date must be today or a future date.');
            }
        }

        if (contact_person_name !== undefined) {
            if (!contact_person_name) {
                errors.push('Contact person name is required.');
            } else if (contact_person_name.length > 500) {
                errors.push('Contact person name must be max 500 characters.');
            }
        }

        if (contact_person_phone !== undefined) {
            if (!contact_person_phone) {
                errors.push('Contact person phone is required.');
            } else if (!/^\d{10}$/.test(contact_person_phone)) {
                errors.push('Contact person phone must be exactly 10 digits.');
            }
        }

        if (notes !== undefined && notes && notes.length > 500) {
            errors.push('Notes must be max 500 characters.');
        }

        const validDispositions = ['pending', 'win', 'lost', 'not_prejudicial'];
        if (matter_disposed !== undefined && !validDispositions.includes(matter_disposed)) {
            errors.push('Matter disposed must be one of: pending, win, lost, not_prejudicial.');
        }

        if (errors.length > 0) {
            return res.status(400).json({ message: errors.join(' ') });
        }
        // --- End validation ---

        // Apply updates (only fields that were sent)
        if (case_title !== undefined) caseItem.case_title = case_title;
        if (year !== undefined) caseItem.year = Number(year);
        if (next_date !== undefined) caseItem.next_date = next_date ? new Date(next_date) : null;
        if (reply_pending !== undefined) caseItem.reply_pending = reply_pending;
        if (admit !== undefined) caseItem.admit = admit;
        if (matter_disposed !== undefined) caseItem.matter_disposed = matter_disposed;
        if (opinion_given !== undefined) caseItem.opinion_given = opinion_given;
        if (contact_person_name !== undefined) caseItem.contact_person_name = contact_person_name;
        if (contact_person_phone !== undefined) caseItem.contact_person_phone = contact_person_phone;
        if (notes !== undefined) caseItem.notes = notes || null;

        const updatedCase = await caseItem.save();
        res.json(updatedCase);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a case (Soft delete)
// @route   DELETE /api/cases/:id
// @access  Private
const deleteCase = async (req: any, res: Response) => {
    try {
        const caseItem = await Case.findOne({
            _id: req.params.id,
            lawyer_id: req.user._id
        });

        if (caseItem) {
            caseItem.is_deleted = true;
            await caseItem.save();
            res.json({ message: 'Case removed (soft delete)' });
        } else {
            res.status(404).json({ message: 'Case not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Search cases by query with optional field filter
// @route   GET /api/cases/search?q=...&field=...
// @access  Private
const searchCases = async (req: any, res: Response) => {
    try {
        const { q, field } = req.query;

        if (!q || typeof q !== 'string' || q.trim().length === 0) {
            return res.status(400).json({ message: 'Search query (q) is required.' });
        }

        const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedQuery, 'i');

        const allowedFields = [
            'case_number', 'case_title', 'contact_person_name',
            'contact_person_phone', 'notes', 'year', 'matter_disposed'
        ];

        const baseFilter: any = { lawyer_id: req.user._id, is_deleted: { $ne: true } };

        let searchFilter: any;

        if (field && typeof field === 'string' && allowedFields.includes(field)) {
            if (field === 'year') {
                const parsed = Number(q);
                if (!isNaN(parsed)) {
                    searchFilter = { ...baseFilter, year: parsed };
                } else {
                    return res.json([]);
                }
            } else {
                searchFilter = { ...baseFilter, [field]: regex };
            }
        } else {
            // Search across all text fields
            searchFilter = {
                ...baseFilter,
                $or: [
                    { case_number: regex },
                    { case_title: regex },
                    { contact_person_name: regex },
                    { contact_person_phone: regex },
                    { notes: regex },
                    { matter_disposed: regex },
                ],
            };
        }

        const cases = await Case.find(searchFilter);
        res.json(cases);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export { getCases, getCaseById, createCase, updateCase, deleteCase, searchCases };

import { Response } from 'express';
import Case from '../models/Case';
// import { AuthRequest } from '../middleware/authMiddleware'; // Assuming AuthRequest is exported

// @desc    Get all cases for logged in lawyer
// @route   GET /api/cases
// @access  Private
const getCases = async (req: any, res: Response) => {
    try {
        const cases = await Case.find({ lawyer_id: req.user._id });
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

        // case_number: required, max 5 digits, digits only
        if (!case_number) {
            errors.push('Case number is required.');
        } else if (!/^\d{1,5}$/.test(case_number)) {
            errors.push('Case number must be 1-5 digits only.');
        }

        // case_title: required, max 500 chars
        if (!case_title) {
            errors.push('Case title is required.');
        } else if (case_title.length > 500) {
            errors.push('Case title must be max 500 characters.');
        }

        // year: required, integer
        if (!year || !Number.isInteger(Number(year))) {
            errors.push('Year is required and must be a valid integer.');
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

        if (caseItem) {
            caseItem.case_number = req.body.case_number || caseItem.case_number;
            caseItem.case_title = req.body.case_title || caseItem.case_title;
            caseItem.year = req.body.year || caseItem.year;
            caseItem.next_date = req.body.next_date || caseItem.next_date;
            caseItem.reply_pending = req.body.reply_pending !== undefined ? req.body.reply_pending : caseItem.reply_pending;
            caseItem.admit = req.body.admit !== undefined ? req.body.admit : caseItem.admit;
            caseItem.matter_disposed = req.body.matter_disposed || caseItem.matter_disposed;
            caseItem.opinion_given = req.body.opinion_given !== undefined ? req.body.opinion_given : caseItem.opinion_given;
            caseItem.contact_person_name = req.body.contact_person_name || caseItem.contact_person_name;
            caseItem.contact_person_phone = req.body.contact_person_phone || caseItem.contact_person_phone;
            caseItem.notes = req.body.notes || caseItem.notes;

            const updatedCase = await caseItem.save();
            res.json(updatedCase);
        } else {
            res.status(404).json({ message: 'Case not found' });
        }
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

export { getCases, getCaseById, createCase, updateCase, deleteCase };

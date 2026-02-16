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

        const caseItem = new Case({
            lawyer_id: req.user._id,
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

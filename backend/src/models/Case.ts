import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const caseSchema = new mongoose.Schema({
    _id: { type: String, default: uuidv4 }, // Explicitly set _id to UUID string
    lawyer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Lawyer', required: true },
    case_number: { type: String, required: true, minlength: 5, maxlength: 5, match: /^\d{5}$/ },
    case_title: { type: String, maxLength: 500, default: null },
    year: { type: Number, required: true },
    next_date: { type: Date, default: null },
    reply_pending: { type: Boolean, default: false },
    admit: { type: Boolean, default: false },
    matter_disposed: {
        type: String,
        enum: ['pending', 'win', 'lost', 'not_prejudicial'],
        default: 'pending'
    },
    opinion_given: { type: Boolean, default: null },
    contact_person_name: { type: String, maxLength: 500, default: null },
    contact_person_phone: { type: String, maxLength: 15, default: null },
    notes: { type: String, maxLength: 500, default: null },
    is_deleted: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
});

// Unique index: case_number must be unique
caseSchema.index({ case_number: 1 }, { unique: true });

const Case = mongoose.model('Case', caseSchema);

export default Case;

import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const caseSchema = new mongoose.Schema({
    _id: { type: String, default: uuidv4 }, // Explicitly set _id to UUID string
    lawyer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Lawyer', required: true },
    case_number: { type: String, required: true, maxLength: 10 },
    case_title: { type: String, required: true, maxLength: 100 },
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
    contact_person_name: { type: String, required: true, maxLength: 100 },
    contact_person_phone: { type: String, required: true, maxLength: 15 },
    notes: { type: String, maxLength: 500, default: null },
    is_deleted: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
});

const Case = mongoose.model('Case', caseSchema);

export default Case;

import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const caseSchema = new mongoose.Schema({
    _id: { type: String, default: uuidv4 }, // Explicitly set _id to UUID string
    lawyer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Lawyer', required: true },
    case_number: { type: String, required: true, minlength: 5, maxlength: 5 },
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
    created_at: { type: Date, default: Date.now }
}, {
    toJSON: {
        transform(_doc, ret: any) {
            ret.id = `${ret.case_number}-${ret.year}`;  // compound key: XXXXX-YYYY
            delete ret._id;
            delete ret.lawyer_id;
            delete ret.created_at;
            delete ret.__v;
        }
    }
});

// Unique per lawyer: same case_number + year cannot appear twice for the same lawyer
caseSchema.index({ lawyer_id: 1, case_number: 1, year: 1 }, { unique: true });

const Case = mongoose.model('Case', caseSchema);

export default Case;

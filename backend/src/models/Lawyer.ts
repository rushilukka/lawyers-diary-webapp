import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const lawyerSchema = new mongoose.Schema({
    name: { type: String, required: true, maxLength: 100 },
    email: { type: String, required: true, unique: true, maxLength: 150 },
    password: { type: String, required: true, maxLength: 255 },
    role: { type: String, enum: ['lawyer', 'admin'], required: true },
    isVerifiedEmail: { type: Boolean, required: true, default: false },
    verificationToken: { type: String, default: null },
    verificationTokenExpiration: { type: Date, default: null },
    twoFactorSecret: { type: String, default: null },
    isTwoFactorEnabled: { type: Boolean, required: true, default: false },
    is2FARemPopUp: { type: Boolean, required: true, default: true },
    created_at: { type: Date, default: Date.now }
});

// Match user entered password to hashed password in database
lawyerSchema.methods.matchPassword = async function (enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Lawyer = mongoose.model('Lawyer', lawyerSchema);

export default Lawyer;

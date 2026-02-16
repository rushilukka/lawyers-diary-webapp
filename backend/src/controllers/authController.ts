import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Lawyer from '../models/Lawyer';

const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

// @desc    Auth lawyer & get token
// @route   POST /api/auth/login
// @access  Public
const authLawyer = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const lawyer: any = await Lawyer.findOne({ email });

    if (lawyer && (await lawyer.matchPassword(password))) {
        res.json({
            _id: lawyer._id,
            name: lawyer.name,
            email: lawyer.email,
            token: generateToken(lawyer._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

export { authLawyer };

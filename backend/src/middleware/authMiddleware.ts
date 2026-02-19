import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import Lawyer from '../models/Lawyer';

interface AuthRequest extends Request {
    user?: any;
}

const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    // 1. Try Authorization header first (works in incognito / when cookies blocked)
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }
    // 2. Fallback to HTTP-only cookie
    else if (req.cookies?.accessToken) {
        token = req.cookies.accessToken;
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = await Lawyer.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized, token expired' });
    }
};

export { protect, AuthRequest };

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Lawyer from '../models/Lawyer';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

const generateAccessToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: ACCESS_TOKEN_EXPIRY,
    });
};

const generateRefreshToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'refresh_secret', {
        expiresIn: REFRESH_TOKEN_EXPIRY,
    });
};

const isProduction = process.env.NODE_ENV === 'production';

const setTokenCookies = (res: Response, accessToken: string, refreshToken: string, rememberMe: boolean) => {
    // Access token cookie — always a session cookie (short-lived JWT handles expiry)
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax', // 'none' required for cross-origin (Render)
        maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Refresh token cookie — persistent if rememberMe, session cookie otherwise
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/api/auth', // Only sent to auth routes
        ...(rememberMe ? { maxAge: REFRESH_TOKEN_MAX_AGE } : {}),
    });
};

const clearTokenCookies = (res: Response) => {
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
    });
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/api/auth',
    });
};

// @desc    Auth lawyer & get token
// @route   POST /api/auth/login
// @access  Public
const authLawyer = async (req: Request, res: Response) => {
    const { email, password, rememberMe } = req.body;

    const lawyer: any = await Lawyer.findOne({ email });

    if (lawyer && (await lawyer.matchPassword(password))) {
        const accessToken = generateAccessToken(lawyer._id);
        const refreshToken = generateRefreshToken(lawyer._id);

        setTokenCookies(res, accessToken, refreshToken, !!rememberMe);

        res.json({
            name: lawyer.name,
            email: lawyer.email,
            accessToken,
            refreshToken,
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Refresh access token using refresh token cookie
// @route   POST /api/auth/refresh
// @access  Public (uses refresh token cookie)
const refreshAccessToken = async (req: Request, res: Response) => {
    // Accept refresh token from cookie or request body (fallback for incognito)
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token' });
    }

    try {
        const decoded: any = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret');

        const lawyer = await Lawyer.findById(decoded.id).select('-password');
        if (!lawyer) {
            return res.status(401).json({ message: 'User not found' });
        }

        const newAccessToken = generateAccessToken(decoded.id);

        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 15 * 60 * 1000,
        });

        res.json({ message: 'Token refreshed', accessToken: newAccessToken });
    } catch (error) {
        clearTokenCookies(res);
        res.status(401).json({ message: 'Invalid refresh token' });
    }
};

// @desc    Logout — clear auth cookies
// @route   POST /api/auth/logout
// @access  Public
const logoutLawyer = async (_req: Request, res: Response) => {
    clearTokenCookies(res);
    res.json({ message: 'Logged out successfully' });
};

// @desc    Get current logged-in user info (for auto-login check)
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req: any, res: Response) => {
    res.json({
        name: req.user.name,
        email: req.user.email,
    });
};

export { authLawyer, refreshAccessToken, logoutLawyer, getMe };

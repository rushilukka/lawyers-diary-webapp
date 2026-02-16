import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Lawyer from './models/Lawyer';
import connectDB from './config/db';

dotenv.config();

const seedUser = async () => {
    try {
        await connectDB();

        const userExists = await Lawyer.findOne({ email: 'test@example.com' });

        if (userExists) {
            console.log('User already exists');
            process.exit();
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const user = await Lawyer.create({
            name: 'Test Lawyer',
            email: 'test@example.com',
            password: hashedPassword,
            role: 'lawyer',
            isVerifiedEmail: true,
            isTwoFactorEnabled: false,
            is2FARemPopUp: true,
        });

        console.log('User created:', user);
        process.exit();
    } catch (error) {
        console.error('Error seeding user:', error);
        process.exit(1);
    }
};

seedUser();

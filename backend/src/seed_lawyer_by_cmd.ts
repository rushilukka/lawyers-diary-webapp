import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Lawyer from './models/Lawyer';
import connectDB from './config/db';

dotenv.config();

/*
npx ts-node src/seed_lawyer_by_cmd.ts "Aditya Davda" "adityadavda@davdaassociates.com" "addavda@3007"
*/

/**
 * Seed a new lawyer into the database.
 *
 * Usage:
 *   npx ts-node src/seed_lawyer_by_cmd.ts <name> <email> <password>
 *
 * Example:
 *   npx ts-node src/seed_lawyer_by_cmd.ts "Rushi Lukka" "rushi@example.com" "mypassword123"
 */

const seedUser = async () => {
    const [, , name, email, password] = process.argv;

    if (!name || !email || !password) {
        console.error('\n❌ Missing arguments!\n');
        console.log('Usage:  npx ts-node src/seed_lawyer_by_cmd.ts <name> <email> <password>');
        console.log('Example: npx ts-node src/seed_lawyer_by_cmd.ts "Rushi Lukka" "rushi@example.com" "mypassword123"\n');
        process.exit(1);
    }

    try {
        await connectDB();

        const userExists = await Lawyer.findOne({ email });

        if (userExists) {
            console.log(`\n⚠️  User with email "${email}" already exists.\n`);
            process.exit();
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await Lawyer.create({
            name,
            email,
            password: hashedPassword,
            role: 'lawyer',
            isVerifiedEmail: true,
            isTwoFactorEnabled: false,
            is2FARemPopUp: true,
        });

        console.log(`\n✅ Lawyer created successfully!`);
        console.log(`   Name:  ${user.name}`);
        console.log(`   Email: ${user.email}\n`);
        process.exit();
    } catch (error) {
        console.error('Error seeding user:', error);
        process.exit(1);
    }
};

seedUser();

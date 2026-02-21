import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Lawyer from '../src/models/Lawyer';
import connectDB from '../src/config/db';

dotenv.config();

/**
Seed an admin lawyer into the database.
 
Usage:
- npx ts-node seeders/seed_lawyer.ts <name> <email> <password> [role]
 
Examples:
- npx ts-node seeders/seed_lawyer.ts "Rushi N Lukka" "rushi@gmail.com" "rushi"
- npx ts-node seeders/seed_lawyer.ts "Staff User" "staff@firm.com" "pass123" lawyer


Or via npm script:
npm run seed:lawyer -- "Rushi N Lukka" "rushi@gmail.com" "mypassword"
 */

const seedLawyer = async () => {
    const [, , name, email, password, roleArg] = process.argv;

    if (!name || !email || !password) {
        console.error('\n❌ Missing arguments!\n');
        console.log('Usage:   npx ts-node seeders/seed_lawyer.ts <name> <email> <password> [role]');
        console.log('Example: npx ts-node seeders/seed_lawyer.ts "Rushi N Lukka" "rushi@gmail.com" "mypassword"\n');
        process.exit(1);
    }

    const role = roleArg === 'lawyer' ? 'lawyer' : 'admin';

    try {
        await connectDB();

        const existing = await Lawyer.findOne({ email });
        if (existing) {
            console.log(`\n⚠️  User with email "${email}" already exists.\n`);
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await Lawyer.create({
            name,
            email,
            password: hashedPassword,
            role,
            isVerifiedEmail: true,
            isTwoFactorEnabled: false,
            is2FARemPopUp: true,
        });

        console.log(`\n✅ Lawyer created successfully!`);
        console.log(`   Name:  ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role:  ${user.role}\n`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding lawyer:', error);
        process.exit(1);
    }
};

seedLawyer();

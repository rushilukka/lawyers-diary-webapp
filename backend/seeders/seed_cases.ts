import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import Case from '../src/models/Case';
import Lawyer from '../src/models/Lawyer';
import connectDB from '../src/config/db';

dotenv.config();

/**
 * Seed sample cases for a given lawyer (dev/staging use only).
 *
 * Usage:
 *   npx ts-node seeders/seed_cases.ts <email>
 *
 * Example:
 *   npx ts-node seeders/seed_cases.ts "rushi@gmail.com"
 *
 * Or via npm script:
 *   npm run seed:cases -- "rushi@gmail.com"
 */

const seedCases = async () => {
    const [, , email] = process.argv;

    if (!email) {
        console.error('\n❌ Missing argument: email\n');
        console.log('Usage:   npx ts-node seeders/seed_cases.ts <email>');
        console.log('Example: npx ts-node seeders/seed_cases.ts "rushi@gmail.com"\n');
        process.exit(1);
    }

    try {
        await connectDB();

        const lawyer = await Lawyer.findOne({ email });
        if (!lawyer) {
            console.error(`\n❌ Lawyer with email "${email}" not found. Run seed_lawyer.ts first.\n`);
            process.exit(1);
        }

        const currentYear = new Date().getFullYear();
        const daysFromNow = (n: number) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

        const cases = [
            {
                lawyer_id: lawyer._id,
                case_number: '00001',
                case_title: 'State vs. Sharma',
                year: currentYear,
                next_date: daysFromNow(10),
                reply_pending: false,
                admit: true,
                matter_disposed: 'pending',
                opinion_given: false,
                contact_person_name: 'Ramesh Sharma',
                contact_person_phone: '9876543210',
                notes: 'Initial hearing scheduled.',
                is_deleted: false,
            },
            {
                lawyer_id: lawyer._id,
                case_number: '00002',
                case_title: 'Mehta vs. City Corporation',
                year: currentYear,
                next_date: daysFromNow(20),
                reply_pending: true,
                admit: true,
                matter_disposed: 'pending',
                opinion_given: true,
                contact_person_name: 'Priya Mehta',
                contact_person_phone: '9123456789',
                notes: 'Reply needs to be filed before next hearing.',
                is_deleted: false,
            },
            {
                lawyer_id: lawyer._id,
                case_number: '00003',
                case_title: 'Patel Property Dispute',
                year: currentYear - 1,
                next_date: daysFromNow(-5),
                reply_pending: false,
                admit: true,
                matter_disposed: 'win',
                opinion_given: true,
                contact_person_name: 'Suresh Patel',
                contact_person_phone: '9988776655',
                notes: 'Case closed in favour of client.',
                is_deleted: false,
            },
        ];

        // Remove existing sample cases for this lawyer before re-seeding
        const deleted = await Case.deleteMany({ lawyer_id: lawyer._id });
        if (deleted.deletedCount > 0) {
            console.log(`🗑️  Removed ${deleted.deletedCount} existing case(s) for ${email}.`);
        }

        const created = await Case.insertMany(cases);

        console.log(`\n✅ Seeded ${created.length} cases for ${email}\n`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding cases:', error);
        process.exit(1);
    }
};

seedCases();

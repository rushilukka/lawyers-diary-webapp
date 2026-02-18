import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Case from './models/Case';
import Lawyer from './models/Lawyer';
import connectDB from './config/db';

dotenv.config();

const seedCases = async () => {
    try {
        await connectDB();

        const lawyer = await Lawyer.findOne({ email: 'test@example.com' });

        if (!lawyer) {
            console.log('Test lawyer not found. Please run seed_user.ts first.');
            process.exit(1);
        }

        const cases = [
            {
                lawyer_id: lawyer._id,
                case_number: '00001',
                case_title: 'Smith vs. Jones',
                year: 2024,
                next_date: new Date(new Date().setDate(new Date().getDate() + 7)),
                reply_pending: false,
                admit: true,
                matter_disposed: 'pending',
                opinion_given: false,
                contact_person_name: 'John Smith',
                contact_person_phone: '5550000101',
                notes: 'Initial hearing scheduled.',
            },
            {
                lawyer_id: lawyer._id,
                case_number: '00002',
                case_title: 'State vs. Doe',
                year: 2024,
                next_date: new Date(new Date().setDate(new Date().getDate() + 14)),
                reply_pending: true,
                admit: true,
                matter_disposed: 'pending',
                opinion_given: true,
                contact_person_name: 'Jane Doe',
                contact_person_phone: '5550000102',
                notes: 'Reply needs to be filed by next week.',
            },
            {
                lawyer_id: lawyer._id,
                case_number: '00089',
                case_title: 'Real Estate Dispute',
                year: 2023,
                next_date: new Date(new Date().setDate(new Date().getDate() - 5)),
                reply_pending: false,
                admit: true,
                matter_disposed: 'win',
                opinion_given: true,
                contact_person_name: 'Robert Brown',
                contact_person_phone: '5550000103',
                notes: 'Case closed.',
            }
        ];

        await Case.deleteMany({ lawyer_id: lawyer._id });
        const createdCases = await Case.insertMany(cases);

        console.log(`Seeded ${createdCases.length} cases for ${lawyer.email}`);
        process.exit();
    } catch (error) {
        console.error('Error seeding cases:', error);
        process.exit(1);
    }
};

seedCases();

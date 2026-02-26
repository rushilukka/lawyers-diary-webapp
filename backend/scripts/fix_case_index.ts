/**
 * One-time migration: drop the old global unique index on case_number
 * and let Mongoose recreate the correct compound index on startup.
 *
 * Run once: npx ts-node scripts/fix_case_index.ts
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || '';

async function run() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db!;
    const col = db.collection('cases');

    const indexes = await col.indexes();
    console.log('Current indexes:', indexes.map(i => i.name));

    const oldIndex = indexes.find(i => i.key && i.key.case_number === 1 && !i.key.lawyer_id);
    if (oldIndex) {
        console.log(`Dropping old index: ${oldIndex.name}`);
        await col.dropIndex(oldIndex.name!);
        console.log('Old index dropped successfully.');
    } else {
        console.log('Old index not found (already removed or never existed).');
    }

    await mongoose.disconnect();
    console.log('Done. Restart your backend — Mongoose will create the correct compound index.');
}

run().catch(err => { console.error(err); process.exit(1); });

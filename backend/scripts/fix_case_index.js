// One-time migration: drop the old global unique index on case_number
// Run: node scripts/fix_case_index.js
require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || '';

async function run() {
    console.log('Connecting to MongoDB...');
    const client = new MongoClient(MONGO_URI);
    await client.connect();

    // Extract DB name from URI or default
    const dbName = MONGO_URI.split('/').pop()?.split('?')[0] || 'lawyers_diary';
    const db = client.db(dbName);
    const col = db.collection('cases');

    const indexes = await col.indexes();
    console.log('Current indexes:', indexes.map(i => `${i.name} -> ${JSON.stringify(i.key)}`));

    // Find any index that only has case_number (old bad index)
    const oldIndex = indexes.find(i => i.name === 'case_number_1');
    if (oldIndex) {
        console.log(`Dropping old index: ${oldIndex.name}`);
        await col.dropIndex('case_number_1');
        console.log('Done! Old global unique index on case_number dropped.');
    } else {
        console.log('Index case_number_1 not found — already removed.');
    }

    await client.close();
    console.log('Restart your backend so Mongoose creates the correct compound index.');
}

run().catch(err => { console.error(err); process.exit(1); });

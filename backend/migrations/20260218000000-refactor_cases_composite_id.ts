import { Db } from 'mongodb';

export const up = async (db: Db, client: any) => {
    // 1. Drop old cases collection
    const collections = await db.listCollections({ name: 'cases' }).toArray();
    if (collections.length > 0) {
        await db.collection('cases').drop();
        console.log('Dropped old cases collection.');
    }

    // 2. Recreate cases collection with updated schema validation
    await db.createCollection('cases', {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["lawyer_id", "case_number", "case_title", "year", "contact_person_name", "contact_person_phone", "created_at"],
                properties: {
                    _id: {
                        bsonType: "string",
                        description: "UUID string"
                    },
                    lawyer_id: {
                        bsonType: "objectId",
                        description: "must be an objectId and is required"
                    },
                    case_number: {
                        bsonType: "string",
                        pattern: "^\\d{5}$",
                        description: "must be exactly 5 digits"
                    },
                    case_title: {
                        bsonType: "string",
                        maxLength: 100,
                        description: "must be a string and is required"
                    },
                    year: {
                        bsonType: "int",
                        description: "must be a 4-digit integer and is required"
                    },
                    next_date: {
                        bsonType: ["date", "null"],
                        description: "must be a date or null"
                    },
                    reply_pending: {
                        bsonType: "bool",
                        description: "must be a boolean"
                    },
                    admit: {
                        bsonType: "bool",
                        description: "must be a boolean"
                    },
                    matter_disposed: {
                        enum: ['pending', 'win', 'lost', 'not_prejudicial'],
                        description: "must be one of the enum values"
                    },
                    opinion_given: {
                        bsonType: ["bool", "null"],
                        description: "must be a boolean or null"
                    },
                    contact_person_name: {
                        bsonType: "string",
                        maxLength: 100,
                        description: "must be a string and is required"
                    },
                    contact_person_phone: {
                        bsonType: "string",
                        maxLength: 15,
                        description: "must be a string and is required"
                    },
                    notes: {
                        bsonType: ["string", "null"],
                        maxLength: 500,
                        description: "must be a string or null"
                    },
                    is_deleted: {
                        bsonType: "bool",
                        description: "must be a boolean"
                    },
                    created_at: {
                        bsonType: "date",
                        description: "must be a date and is required"
                    }
                }
            }
        }
    });

    // 3. Indexes
    await db.collection('cases').createIndex({ lawyer_id: 1 });
    await db.collection('cases').createIndex(
        { case_number: 1 },
        { unique: true }
    );
    console.log('✅ cases collection recreated with updated schema and unique index on { case_number }.');
};

export const down = async (db: Db, client: any) => {
    await db.collection('cases').drop();
};

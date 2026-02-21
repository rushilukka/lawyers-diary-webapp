import { Db } from 'mongodb';

export const up = async (db: Db, client: any) => {
    // Create collection with schema validation
    await db.createCollection('lawyers', {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["name", "email", "password", "role", "isVerifiedEmail", "isTwoFactorEnabled", "is2FARemPopUp", "created_at"],
                properties: {
                    _id: {
                        bsonType: "objectId"
                    },
                    name: {
                        bsonType: "string",
                        maxLength: 100,
                        description: "must be a string and is required"
                    },
                    email: {
                        bsonType: "string",
                        maxLength: 150,
                        description: "must be a string and is required"
                    },
                    password: {
                        bsonType: "string",
                        maxLength: 255,
                        description: "must be a string and is required"
                    },
                    role: {
                        enum: ["lawyer", "admin"],
                        description: "can only be one of the enum values and is required"
                    },
                    isVerifiedEmail: {
                        bsonType: "bool",
                        description: "must be a boolean and is required"
                    },
                    verificationToken: {
                        bsonType: ["string", "null"],
                        description: "must be a string or null"
                    },
                    verificationTokenExpiration: {
                        bsonType: ["date", "null"],
                        description: "must be a date or null"
                    },
                    twoFactorSecret: {
                        bsonType: ["string", "null"],
                        description: "must be a string or null"
                    },
                    isTwoFactorEnabled: {
                        bsonType: "bool",
                        description: "must be a boolean and is required"
                    },
                    is2FARemPopUp: {
                        bsonType: "bool",
                        description: "must be a boolean and is required"
                    },
                    created_at: {
                        bsonType: "date",
                        description: "must be a date and is required"
                    }
                }
            }
        }
    });

    // Create unique index for email
    await db.collection('lawyers').createIndex({ email: 1 }, { unique: true });
    console.log('✅ lawyers collection created with schema validation and unique email index.');
};

export const down = async (db: Db, client: any) => {
    await db.collection('lawyers').drop();
};

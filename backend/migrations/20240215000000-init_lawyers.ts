import { Db } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';

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

    // --- Seeder Logic ---
    const lawyerId = uuidv4();
    const now = new Date();

    // Hash password (using email as password source based on user example request)
    const hashedPassword = await bcrypt.hash('rushi@gmail.com', 10);

    const verificationToken = 'dummy-verification-token';
    const verificationTokenExpiration = new Date();
    verificationTokenExpiration.setHours(verificationTokenExpiration.getHours() + 6);

    await db.collection('lawyers').insertOne({

        name: 'Rushi N Lukka',
        email: 'rushi@gmail.com',
        password: hashedPassword,
        role: 'admin',
        isVerifiedEmail: true,
        verificationToken: verificationToken,
        verificationTokenExpiration: verificationTokenExpiration,
        twoFactorSecret: null,
        isTwoFactorEnabled: false,
        is2FARemPopUp: true,
        created_at: now,
    });

    console.log(`Default lawyer created with ID: ${lawyerId}`);
};

export const down = async (db: Db, client: any) => {
    // Remove the specific seeded user if we want strict rollback, or just drop collection.
    // Since up creates the collection, down dropping it is correct.
    await db.collection('lawyers').drop();
};

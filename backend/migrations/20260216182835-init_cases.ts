import { Db } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

export const up = async (db: Db, client: any) => {
  // 1. Create cases collection with schema validation
  await db.createCollection('cases', {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["lawyer_id", "case_number", "case_title", "year", "contact_person_name", "contact_person_phone", "created_at"],
        properties: {
          _id: {
            bsonType: "string", // UUID string
            description: "must be a string and is required"
          },
          lawyer_id: {
            bsonType: "objectId",
            description: "must be an objectId and is required"
          },
          case_number: {
            bsonType: "string",
            maxLength: 10,
            description: "must be a string and is required"
          },
          case_title: {
            bsonType: "string",
            maxLength: 100,
            description: "must be a string and is required"
          },
          year: {
            bsonType: "int",
            description: "must be an integer and is required"
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

  // Indexes
  await db.collection('cases').createIndex({ lawyer_id: 1 });
  await db.collection('cases').createIndex({ case_number: 1 }); // Optional: unique per lawyer? User didn't specify unique, matching SQL which just had allowNullable: false

  // 2. Seeder Logic
  // Find the default lawyer created in the previous migration
  const lawyer = await db.collection('lawyers').findOne({ email: 'rushi@gmail.com' });

  if (!lawyer) {
    console.warn("User 'rushi@gmail.com' not found. Skipping case seeding.");
    return;
  }

  const now = new Date();
  // Helper to generate a future date or null
  const dateHelper = (dateStr: string | null) => dateStr ? new Date(dateStr) : null;

  const cases = [
    {
      _id: uuidv4(),
      lawyer_id: lawyer._id,
      case_number: 'C-2025-001',
      case_title: 'Doe vs. The World',
      year: 2025,
      next_date: dateHelper('2025-09-15'),
      reply_pending: false,
      admit: true,
      matter_disposed: 'pending',
      opinion_given: false,
      contact_person_name: 'Alice',
      contact_person_phone: '1112223333',
      notes: 'A very important case.',
      is_deleted: false,
      created_at: now,
    },
    {
      _id: uuidv4(),
      lawyer_id: lawyer._id,
      case_number: 'C-2025-002',
      case_title: 'Smith vs. The Universe',
      year: 2025,
      next_date: dateHelper('2025-10-20'),
      reply_pending: true,
      admit: false,
      matter_disposed: 'pending',
      opinion_given: null,
      contact_person_name: 'Bob',
      contact_person_phone: '4445556666',
      notes: 'A case with universal implications.',
      is_deleted: false,
      created_at: now,
    },
    {
      _id: uuidv4(),
      lawyer_id: lawyer._id,
      case_number: 'C-2025-003',
      case_title: 'Doe vs. Mars Corp',
      year: 2025,
      next_date: dateHelper('2025-11-01'),
      reply_pending: true,
      admit: true,
      matter_disposed: 'pending',
      opinion_given: true,
      contact_person_name: 'Charlie',
      contact_person_phone: '7778889999',
      notes: 'Interplanetary litigation.',
      is_deleted: false,
      created_at: now,
    }
  ];

  await db.collection('cases').insertMany(cases as any);
  console.log(`Seeded ${cases.length} cases for lawyer ${lawyer.email}`);
};

export const down = async (db: Db, client: any) => {
  await db.collection('cases').drop();
};

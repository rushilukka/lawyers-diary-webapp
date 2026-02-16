import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Lawyers Diary API',
            version: '1.0.0',
            description: 'API documentation for Lawyers Diary Webapp',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Local server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Helper_Lawyer: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' }
                    }
                },
                Case: {
                    type: 'object',
                    required: ['lawyer_id', 'case_number', 'case_title', 'year', 'contact_person_name', 'contact_person_phone'],
                    properties: {
                        _id: { type: 'string', description: 'UUID' },
                        lawyer_id: { type: 'string', description: 'ObjectId' },
                        case_number: { type: 'string' },
                        case_title: { type: 'string' },
                        year: { type: 'integer' },
                        next_date: { type: 'string', format: 'date' },
                        reply_pending: { type: 'boolean' },
                        admit: { type: 'boolean' },
                        matter_disposed: {
                            type: 'string',
                            enum: ['pending', 'win', 'lost', 'not_prejudicial']
                        },
                        opinion_given: { type: 'boolean' },
                        contact_person_name: { type: 'string' },
                        contact_person_phone: { type: 'string' },
                        notes: { type: 'string' },
                        is_deleted: { type: 'boolean' },
                        created_at: { type: 'string', format: 'date-time' }
                    }
                },
                CaseInput: {
                    type: 'object',
                    required: ['case_number', 'case_title', 'year', 'contact_person_name', 'contact_person_phone'],
                    properties: {
                        case_number: { type: 'string' },
                        case_title: { type: 'string' },
                        year: { type: 'integer' },
                        next_date: { type: 'string', format: 'date' },
                        reply_pending: { type: 'boolean' },
                        admit: { type: 'boolean' },
                        matter_disposed: {
                            type: 'string',
                            enum: ['pending', 'win', 'lost', 'not_prejudicial']
                        },
                        opinion_given: { type: 'boolean' },
                        contact_person_name: { type: 'string' },
                        contact_person_phone: { type: 'string' },
                        notes: { type: 'string' }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;

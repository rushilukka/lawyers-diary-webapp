import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
        const dbName = process.env.DB_NAME || 'lawyers_diary';

        const conn = await mongoose.connect(uri, { dbName });
        console.log(`MongoDB Connected: ${conn.connection.host} → DB: ${conn.connection.name}`);
    } catch (error: any) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        console.warn('Server will continue running. Health endpoint will be available.');
    }
};

export default connectDB;

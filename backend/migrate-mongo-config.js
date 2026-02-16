// migrate-mongo-config.js
require('dotenv').config();

const config = {
    mongodb: {
        url: process.env.MONGODB_URI || "mongodb://localhost:27017",
        databaseName: process.env.DB_NAME || "lawyers_diary_db",
        options: {}
    },
    migrationsDir: "migrations",
    changelogCollectionName: "changelog",
    migrationFileExtension: ".ts",
    useFileHash: false,
    moduleSystem: 'commonjs',
};

module.exports = config;

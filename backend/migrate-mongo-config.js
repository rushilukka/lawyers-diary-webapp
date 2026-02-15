// migrate-mongo-config.js
require('ts-node/register');
require('dotenv').config();

const config = {
    mongodb: {
        url: process.env.MONGO_URI || "mongodb://localhost:27017",
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

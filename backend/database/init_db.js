const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const initDb = async () => {
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');

        // Split queries by semicolon, but handle empty lines
        const queries = sql.split(';').map(q => q.trim()).filter(q => q.length > 0);

        for (const query of queries) {
            await db.query(query);
            console.log('Executed query');
        }

        console.log('Database initialized successfully');
        process.exit();
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
};

initDb();

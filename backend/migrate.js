const db = require('./config/db');

async function migrate() {
    try {
        console.log("Adding personal_email...");
        await db.query("ALTER TABLE students ADD COLUMN personal_email VARCHAR(255) NULL");
    } catch (e) { console.log(e.message); }

    try {
        console.log("Adding alt_phone...");
        await db.query("ALTER TABLE students ADD COLUMN alt_phone VARCHAR(15) NULL");
    } catch (e) { console.log(e.message); }

    try {
        console.log("Adding has_backlog...");
        await db.query("ALTER TABLE students ADD COLUMN has_backlog BOOLEAN DEFAULT FALSE");
    } catch (e) { console.log(e.message); }

    try {
        console.log("Adding backlog_count...");
        await db.query("ALTER TABLE students ADD COLUMN backlog_count INT DEFAULT 0");
    } catch (e) { console.log(e.message); }

    console.log("Migration complete.");
    process.exit(0);
}

migrate();

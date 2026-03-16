const db = require('./config/db');

async function migrate_drives() {
    try {
        console.log("Checking and adding drive_start_date...");
        await db.query("ALTER TABLE placement_drives ADD COLUMN drive_start_date DATE NULL");
    } catch (e) {
        console.log(e.message);
    }
    try {
        console.log("Checking and adding drive_end_date...");
        await db.query("ALTER TABLE placement_drives ADD COLUMN drive_end_date DATE NULL");
    } catch (e) {
        console.log(e.message);
    }

    // Default existing active drives to something basic if missing
    try {
        await db.query("UPDATE placement_drives SET drive_start_date = drive_date WHERE drive_start_date IS NULL");
        await db.query("UPDATE placement_drives SET drive_end_date = application_deadline WHERE drive_end_date IS NULL");
    } catch (e) {
        console.log(e.message);
    }

    console.log("Migration complete.");
    process.exit(0);
}

migrate_drives();

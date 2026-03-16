const db = require('./config/db');

const migrate = async () => {
    try {
        console.log('Running settings module migrations...');

        // 1. notification_preferences table
        await db.query(`
            CREATE TABLE IF NOT EXISTS notification_preferences (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                role VARCHAR(20),
                drive_notifications BOOLEAN DEFAULT TRUE,
                application_updates BOOLEAN DEFAULT TRUE,
                shortlist_alerts BOOLEAN DEFAULT TRUE
            );
        `);
        console.log('created notification_preferences table');

        // 2. Add columns to students table
        const addColumn = async (columnName, columnType) => {
            try {
                // Check if column exists
                const [rows] = await db.query(`
                    SELECT * 
                    FROM information_schema.columns 
                    WHERE table_schema = DATABASE() 
                    AND table_name = 'students' 
                    AND column_name = ?
                `, [columnName]);
                
                if (rows.length === 0) {
                    await db.query(`ALTER TABLE students ADD COLUMN ${columnName} ${columnType}`);
                    console.log(`Added column ${columnName} to students table.`);
                } else {
                    console.log(`Column ${columnName} already exists in students table.`);
                }
            } catch (err) {
                console.error(`Error checking/adding column ${columnName}:`, err);
            }
        };

        await addColumn('linkedin_url', 'VARCHAR(255)');
        await addColumn('github_url', 'VARCHAR(255)');
        await addColumn('portfolio_url', 'VARCHAR(255)');

        console.log('Settings migrations complete!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();

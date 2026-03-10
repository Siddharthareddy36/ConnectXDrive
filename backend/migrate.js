const db = require('./config/db');

const migrate = async () => {
    try {
        console.log('Running migrations...');

        await db.query(`
            CREATE TABLE IF NOT EXISTS placement_drives (
                id INT AUTO_INCREMENT PRIMARY KEY,
                company_name VARCHAR(255),
                role VARCHAR(255),
                description TEXT,
                eligible_departments VARCHAR(255),
                drive_date DATE,
                application_deadline DATE,
                created_by INT,
                status VARCHAR(50) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('created placement_drives');

        await db.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT,
                message TEXT,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('created notifications');

        await db.query(`
            CREATE TABLE IF NOT EXISTS drive_applications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                drive_id INT,
                student_id INT,
                status VARCHAR(50) DEFAULT 'applied',
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('created drive_applications');

        console.log('Migrations complete!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();

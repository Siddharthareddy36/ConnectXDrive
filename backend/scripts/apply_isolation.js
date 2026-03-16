const db = require('../config/db');

async function run() {
    try {
        console.log("Applying Database Isolation Changes...");

        try {
            await db.query("CREATE INDEX idx_branch_id ON students (branch, id)");
            console.log("Added idx_branch_id index.");
        } catch (e) {
            console.log("Index might already exist or error: " + e.message);
        }

        const views = [
            "CREATE OR REPLACE VIEW students_ds AS SELECT * FROM students WHERE branch = 'DS'",
            "CREATE OR REPLACE VIEW students_aiml AS SELECT * FROM students WHERE branch = 'AIML'",
            "CREATE OR REPLACE VIEW students_it AS SELECT * FROM students WHERE branch = 'IT'",
            "CREATE OR REPLACE VIEW students_cse AS SELECT * FROM students WHERE branch = 'CSE'",
            "CREATE OR REPLACE VIEW students_cs_cybersecurity AS SELECT * FROM students WHERE branch = 'CS-Cybersecurity'"
        ];

        for (let view of views) {
            await db.query(view);
        }
        console.log("Views created successfully.");

        process.exit(0);
    } catch (error) {
        console.error("Error applying changes:", error);
        process.exit(1);
    }
}
run();

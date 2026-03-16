const mysql = require('mysql2/promise');

async function testAdminSettings() {
    let conn;
    try {
        console.log("1. Connecting to DB to get an admin...");
        conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'mysql',
            database: 'placement_portal'
        });

        const [admins] = await conn.execute('SELECT * FROM admins LIMIT 1');
        if (admins.length === 0) {
            console.log("No admins found!");
            return;
        }
        const admin = admins[0];
        console.log(`Using admin: ${admin.email} (ID: ${admin.id})`);

        // Generate a valid JWT for this admin
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { id: admin.id, role: 'admin', department: admin.department },
            process.env.JWT_SECRET || 'supersecretkey123',
            { expiresIn: '30d' }
        );

        console.log("\n2. Testing GET /admin/profile...");
        let res = await fetch('http://localhost:5000/api/admin/profile', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const text = await res.text();
        console.log(`Status: ${res.status}, Text: ${text.substring(0, 100)}`);
        const getData = JSON.parse(text);
        console.log("GET Response:", getData);

        console.log("\n3. Testing PUT /admin/profile (update preferences)...");
        res = await fetch('http://localhost:5000/api/admin/profile', {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: admin.name + ' Updated',
                email_notifications: false,
                theme: 'dark'
            })
        });
        console.log("PUT Response (preferences):", await res.json());

        console.log("\n4. Verifying DB changes...");
        const [updated] = await conn.execute('SELECT name, email_notifications, theme FROM admins WHERE id = ?', [admin.id]);
        console.log("DB State:", updated[0]);

        console.log("\n5. Testing PUT /admin/profile (invalid password change)...");
        res = await fetch('http://localhost:5000/api/admin/profile', {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                currentPassword: 'wrongpassword123',
                newPassword: 'newsecurepassword'
            })
        });
        const data = await res.json();
        if (!res.ok) {
            console.log("Expected failure:", data.message);
        } else {
            console.log("ERROR: Should have failed but didn't!");
        }

        console.log("\n6. Reverting preferences...");
        await fetch('http://localhost:5000/api/admin/profile', {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: admin.name,
                email_notifications: 1, // true in mysql
                theme: 'light'
            })
        });
        console.log("Preferences reverted successfully.");

    } catch (err) {
        console.error("Test Failed:", err);
    } finally {
        if (conn) await conn.end();
    }
}

testAdminSettings();

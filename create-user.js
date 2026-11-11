const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');

const db = new sqlite3.Database('./database.sqlite');

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

db.serialize(() => {
    // 1. Pehle users table create karein agar nahi hai
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'SalesManager'
        )
    `, (err) => {
        if (err) {
            console.error("Table creation error:", err.message);
            return;
        }

        // 2. Table banne ke baad user insert karein
        const username = 'admin';
        const password = 'adminpassword123'; // Aapka password
        const role = 'Admin';
        const hashedPassword = hashPassword(password);

        const sql = `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`;
        
        db.run(sql, [username, hashedPassword, role], function(insertErr) {
            if (insertErr) {
                if (insertErr.message.includes('UNIQUE') || insertErr.message.includes('constraint')) {
                    console.log("User 'admin' pehle se bana hua hai!");
                } else {
                    console.error('User Insert Error:', insertErr.message);
                }
            } else {
                console.log(`SUCCESS: 'users' table bani aur user '${username}' create ho gaya (ID: ${this.lastID})!`);
            }
            db.close();
        });
    });
});

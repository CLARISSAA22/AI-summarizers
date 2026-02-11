const dns = require('dns');
try {
    dns.setServers(['8.8.8.8']);
    const originalLookup = dns.lookup;
    dns.lookup = (hostname, options, callback) => {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }
        if (hostname.includes('neon.tech')) {
            console.log(`[DNS PATCH] Resolving ${hostname} via 8.8.8.8...`);
            dns.resolve4(hostname, (err, addresses) => {
                if (err) {
                    console.error(`[DNS PATCH] Failed:`, err.message);
                    return originalLookup(hostname, options, callback);
                }
                const ip = String(addresses[0]);
                console.log(`[DNS PATCH] Resolved to ${ip} (options.all=${options.all})`);
                if (options.all) {
                    callback(null, [{ address: ip, family: 4 }]);
                } else {
                    callback(null, ip, 4);
                }
            });
        } else {
            originalLookup(hostname, options, callback);
        }
    };
} catch (e) { console.error('DNS bugfix failed', e); }

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function main() {
    const client = await pool.connect();

    try {
        // Create Users Table
        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        is_approved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS notes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        video_url TEXT NOT NULL,
        video_title TEXT,
        thumbnail_url TEXT,
        summary TEXT,
        study_notes TEXT,
        key_points TEXT,
        revision_notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('Created "notes" table.');

        console.log('Created "users" table.');

        // Create Admin User
        const adminEmail = 'test@test.com';
        const adminPassword = 'Test123@123';
        const passwordHash = await bcrypt.hash(adminPassword, 10);

        const res = await client.query(`
      INSERT INTO users (email, password_hash, role, is_approved)
      VALUES ($1, $2, 'admin', TRUE)
      ON CONFLICT (email) DO NOTHING
      RETURNING *;
    `, [adminEmail, passwordHash]);

        if (res.rows.length > 0) {
            console.log('Admin user created:', res.rows[0].email);
        } else {
            console.log('Admin user already exists.');
        }

    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

main();

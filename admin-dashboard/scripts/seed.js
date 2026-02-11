
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

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
    `);

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

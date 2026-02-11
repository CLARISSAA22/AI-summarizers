
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const client = await pool.connect();
        try {
            // Create new user (default: role='user', is_approved=false)
            const res = await client.query(
                `INSERT INTO users (email, password_hash, role, is_approved)
         VALUES ($1, $2, 'user', FALSE)
         RETURNING id, email, role, is_approved, created_at`,
                [email, hashedPassword]
            );

            const newUser = res.rows[0];
            return NextResponse.json({ message: 'User created successfully', user: newUser }, { status: 201 });
        } finally {
            client.release();
        }
    } catch (error: any) {
        console.error('Signup error:', error);
        if (error.code === '23505') { // Unique violation for email
            return NextResponse.json({ error: 'User already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { login } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            const res = await client.query('SELECT * FROM users WHERE email = $1', [email]);
            const user = res.rows[0];

            if (!user) {
                return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
            }

            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
            }

            if (!user.is_approved) {
                return NextResponse.json({ error: 'Account pending approval' }, { status: 403 });
            }

            // Login successful, create session
            await login({ id: user.id, email: user.email, role: user.role });

            return NextResponse.json({ message: 'Login successful', user: { email: user.email, role: user.role } });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

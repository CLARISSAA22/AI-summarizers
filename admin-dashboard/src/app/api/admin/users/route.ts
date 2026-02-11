
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { decrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

// Helper to verify admin role
async function isAdmin() {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return false;
    try {
        const payload = await decrypt(session);
        return payload.user.role === 'admin';
    } catch {
        return false;
    }
}

export async function GET() {
    if (!await isAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await pool.connect();
    try {
        const res = await client.query('SELECT id, email, role, is_approved, created_at FROM users ORDER BY created_at DESC');
        return NextResponse.json(res.rows);
    } finally {
        client.release();
    }
}

export async function PUT(request: Request) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, is_approved } = await request.json();

    const client = await pool.connect();
    try {
        await client.query('UPDATE users SET is_approved = $1 WHERE id = $2', [is_approved, userId]);
        return NextResponse.json({ message: 'User updated' });
    } finally {
        client.release();
    }
}

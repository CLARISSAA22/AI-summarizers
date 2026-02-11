
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { decrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

async function getSessionUser() {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return null;
    try {
        const payload = await decrypt(session);
        return payload.user;
    } catch {
        return null;
    }
}

export async function GET() {
    const user = await getSessionUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await pool.connect();
    try {
        // Total stats for Admin
        if (user.role === 'admin') {
            const usersCount = await client.query('SELECT COUNT(*) FROM users');
            const totalNotes = await client.query('SELECT COUNT(*) FROM notes');
            const pendingUsers = await client.query('SELECT COUNT(*) FROM users WHERE is_approved = false AND role != $1', ['admin']);

            return NextResponse.json({
                totalUsers: parseInt(usersCount.rows[0].count),
                totalNotes: parseInt(totalNotes.rows[0].count),
                pendingApprovals: parseInt(pendingUsers.rows[0].count)
            });
        }

        // Stats for regular users
        const userNotes = await client.query('SELECT COUNT(*) FROM notes WHERE user_id = $1', [user.id]);
        return NextResponse.json({
            yourNotes: parseInt(userNotes.rows[0].count)
        });

    } catch (err) {
        console.error('Error fetching stats:', err);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    } finally {
        client.release();
    }
}

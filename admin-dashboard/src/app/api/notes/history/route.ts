
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await pool.connect();
        try {
            const result = await client.query(
                `SELECT id, video_title, thumbnail_url, created_at, summary 
                 FROM notes 
                 WHERE user_id = $1 
                 ORDER BY created_at DESC`,
                [session.user.id]
            );
            return NextResponse.json({ notes: result.rows });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error fetching history:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

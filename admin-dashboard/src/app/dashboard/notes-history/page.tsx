import pool from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import SearchableNotes from '@/components/SearchableNotes';

export default async function HistoryPage() {
    const session = await getSession();
    if (!session || !session.user) redirect('/login');

    const client = await pool.connect();
    let notes = [];
    try {
        const res = await client.query(
            'SELECT id, video_title, thumbnail_url, created_at, video_url FROM notes WHERE user_id = $1 ORDER BY created_at DESC',
            [session.user.id]
        );
        notes = res.rows;
    } finally {
        client.release();
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Your History</h1>
                    <p className="text-gray-500 mt-2">Manage and review your AI-generated study notes.</p>
                </div>
                {notes.length > 0 && (
                    <Link
                        href="/dashboard/ai-notes"
                        className="hidden md:flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                    >
                        New Notes
                    </Link>
                )}
            </div>

            {notes.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-[2rem] shadow-sm border border-gray-100">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 mb-6">
                        <Clock className="w-10 h-10 text-indigo-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">No notes found</h3>
                    <p className="mt-3 text-gray-500 max-w-sm mx-auto text-lg leading-relaxed">
                        Start your learning journey by generating your first AI study guide.
                    </p>
                    <Link
                        href="/dashboard/ai-notes"
                        className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 mt-8 shadow-xl shadow-indigo-200 transition-all transform hover:scale-105 active:scale-95"
                    >
                        Create New Notes
                    </Link>
                </div>
            ) : (
                <SearchableNotes initialNotes={notes} />
            )}
        </div>
    );
}

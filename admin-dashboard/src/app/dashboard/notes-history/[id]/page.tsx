
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Youtube, Bot } from 'lucide-react';
import NoteContent from '@/components/NoteContent';
import VideoChat from '@/components/VideoChat';

export default async function NoteDetailPage({ params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session || !session.user) redirect('/login');
    const { id } = await params;

    const client = await pool.connect();
    let note = null;
    try {
        const res = await client.query('SELECT * FROM notes WHERE id = $1 AND user_id = $2', [id, session.user.id]);
        if (res.rows.length > 0) note = res.rows[0];
    } catch (e) {
        console.error('Error fetching note', e);
    } finally {
        client.release();
    }

    if (!note) notFound();

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <Link href="/dashboard/notes-history" className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors mb-4">
                <ArrowLeft className="w-4 h-4" />
                Back to History
            </Link>

            <div className="flex flex-col md:flex-row gap-6 md:items-start">
                {/* Video Info Card */}
                <div className="w-full md:w-1/3 space-y-4">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-4 relative group">
                            {note.thumbnail_url && (
                                <img src={note.thumbnail_url} alt={note.video_title} className="w-full h-full object-cover" />
                            )}
                            <a href={note.video_url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-red-600 text-white p-3 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                                    <Youtube className="w-6 h-6" />
                                </div>
                            </a>
                        </div>
                        <h1 className="font-bold text-gray-900 text-lg leading-tight mb-2">{note.video_title || 'Untitled'}</h1>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(note.created_at).toLocaleDateString()}</span>
                        </div>
                        <a
                            href={note.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 block w-full text-center py-2.5 rounded-lg bg-gray-50 text-gray-700 font-medium hover:bg-gray-100 transition-colors text-sm"
                        >
                            Watch on YouTube
                        </a>
                    </div>
                </div>

                {/* Content */}
                <div className="w-full md:w-2/3 space-y-6">
                    <NoteContent data={{
                        summary: note.summary,
                        key_points: note.key_points,
                        study_notes: note.study_notes,
                        revision_notes: note.revision_notes,
                        flashcards: note.flashcards
                    }} />

                    <div className="mt-8">
                        <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                            <Bot className="w-6 h-6 text-indigo-600" />
                            Chat with Video AI
                        </h2>
                        <VideoChat noteId={note.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}

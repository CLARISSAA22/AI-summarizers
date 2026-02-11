
import YouTubeSummarizer from '@/components/YouTubeSummarizer';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AISummarizerPage() {
    const session = await getSession();

    if (!session || !session.user) {
        redirect('/login');
    }

    // Note: AI Study Notes are available to all authenticated users
    // regardless of approval status to allow immediate utility.

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">AI Study Notes</h1>
            <YouTubeSummarizer />
        </div>
    );
}

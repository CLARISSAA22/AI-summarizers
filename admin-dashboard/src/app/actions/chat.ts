
'use server';

import OpenAI from 'openai';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
});

export async function chatVideo(noteId: string, message: string) {
    try {
        const session = await getSession();
        if (!session || !session.user) {
            return { success: false, error: 'Unauthorized' };
        }

        // 1. Fetch transcript from DB
        const client = await pool.connect();
        let transcript = '';
        try {
            const res = await client.query('SELECT transcript FROM notes WHERE id = $1 AND user_id = $2', [noteId, session.user.id]);
            if (res.rows.length === 0) return { success: false, error: 'Note not found' };
            transcript = res.rows[0].transcript || '';
        } finally {
            client.release();
        }

        if (!transcript) {
            return { success: false, error: 'No transcript available for this video' };
        }

        // 2. Query OpenAI
        const response = await openai.chat.completions.create({
            model: "openai/gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are a helpful study assistant. Use the provided video transcript to answer the user's questions. 
                    - Base your answers ONLY on the transcript.
                    - If the answer isn't in the transcript, say you don't know based on the video.
                    - Keep answers concise and helpful for a student.
                    
                    Transcript:
                    ${transcript.substring(0, 30000)}` // Limit for token safety
                },
                { role: "user", content: message }
            ],
            temperature: 0.7,
        });

        return {
            success: true,
            message: response.choices[0].message.content
        };

    } catch (error: any) {
        console.error('Chat Error:', error);
        return { success: false, error: 'Failed to get AI response' };
    }
}

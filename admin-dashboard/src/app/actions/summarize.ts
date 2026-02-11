'use server';

import OpenAI from 'openai';
import { YoutubeTranscript } from 'youtube-transcript';
import { Innertube, UniversalCache } from 'youtubei.js';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
});

// Helper function to fetch transcript with fallbacks
export async function fetchTranscript(videoId: string): Promise<string> {
    console.log(`Attempting to fetch transcript for: ${videoId}`);

    // Strategy 1: youtube-transcript (Fastest, Pure JS)
    try {
        console.log('Strategy 1: Trying youtube-transcript...');
        const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });
        if (transcriptItems && transcriptItems.length > 0) {
            console.log('Strategy 1 Success!');
            return transcriptItems.map(item => item.text).join(' ');
        }
    } catch (e: any) {
        console.warn(`Strategy 1 failed: ${e.message}`);
    }

    // Strategy 2: youtubei.js (Robust, simulates client)
    try {
        console.log('Strategy 2: Trying youtubei.js...');
        const youtube = await Innertube.create({ cache: new UniversalCache(false), generate_session_locally: true });
        const info = await youtube.getInfo(videoId);
        const transcriptData = await info.getTranscript();

        if (transcriptData?.transcript?.content?.body?.initial_segments) {
            const segments = transcriptData.transcript.content.body.initial_segments;
            const text = segments.map((s: any) => s.snippet.text).join(' ');
            console.log('Strategy 2 Success!');
            return text;
        }
    } catch (e: any) {
        console.warn(`Strategy 2 failed: ${e.message}`);
    }

    // Strategy 3: Python yt-dlp 
    try {
        console.log('Strategy 3: Trying python yt-dlp...');
        const { exec } = await import('child_process');
        const util = await import('util');
        const execAsync = util.promisify(exec);
        const fs = await import('fs');
        const path = await import('path');
        const os = await import('os');

        const tempDir = os.tmpdir();
        const baseName = `yt-summary-${videoId}-${Date.now()}`;
        const outputPath = path.join(tempDir, baseName);
        const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
        const cmd = `${pythonCmd} -m yt_dlp "https://www.youtube.com/watch?v=${videoId}" --skip-download --write-sub --write-auto-sub --sub-lang en,en-US --output "${outputPath}" --no-check-certificates --no-warnings --prefer-free-formats`;

        console.log(`Executing: ${cmd}`);
        await execAsync(cmd);

        const dirFiles = fs.readdirSync(tempDir);
        const captionFile = dirFiles.find(f => f.startsWith(baseName) && (f.endsWith('.vtt') || f.endsWith('.ttml') || f.endsWith('.srv3')));

        if (captionFile) {
            const fullPath = path.join(tempDir, captionFile);
            let content = fs.readFileSync(fullPath, 'utf-8');
            try { fs.unlinkSync(fullPath); } catch (e) { /* ignore */ }
            return content
                .replace(/WEBVTT/g, '')
                .replace(/(\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3})/g, '')
                .replace(/(\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}\.\d{3})/g, '')
                .replace(/<[^>]*>/g, '')
                .replace(/\n+/g, ' ')
                .trim();
        }
    } catch (e: any) {
        console.warn(`Strategy 3 failed: ${e.message}`);
    }

    throw new Error('Could not retrieve transcript from any source.');
}

export async function getVideoMetadata(videoId: string) {
    try {
        const youtube = await Innertube.create({ cache: new UniversalCache(false), generate_session_locally: true });
        const info = await youtube.getInfo(videoId);
        return {
            title: info.basic_info.title || 'Unknown Title',
            thumbnail_url: info.basic_info.thumbnail?.[0]?.url || ''
        };
    } catch (e) {
        console.warn('Failed to fetch video metadata:', e);
        return { title: 'Unknown Title', thumbnail_url: '' };
    }
}

export async function generateStudyNotes(videoUrl: string) {
    try {
        const session = await getSession();
        if (!session || !session.user) {
            return { success: false, error: 'Unauthorized. Please login.' };
        }
        const user = session.user;
        console.log('Session User:', user);

        // Verify user exists in DB to avoid foreign key violation
        const dbClient = await pool.connect();
        try {
            const userCheck = await dbClient.query('SELECT id FROM users WHERE id = $1', [user.id]);
            if (userCheck.rows.length === 0) {
                return { success: false, error: 'User session is invalid or user no longer exists. Please logout and login again.' };
            }
        } finally {
            dbClient.release();
        }

        // 1. Extract Video ID
        let videoId = "";
        try {
            if (videoUrl.includes('youtube.com/watch')) {
                const urlObj = new URL(videoUrl);
                videoId = urlObj.searchParams.get('v') || "";
            }
            else if (videoUrl.includes('youtu.be/')) {
                const urlObj = new URL(videoUrl);
                videoId = urlObj.pathname.slice(1);
            }
            if (!videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoUrl)) {
                videoId = videoUrl;
            }
        } catch (e) { }

        if (!videoId) {
            const match = videoUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/);
            if (match) videoId = match[1];
        }

        if (!videoId) {
            return { success: false, error: 'Invalid YouTube URL.' };
        }

        // 2. Fetch Metadata & Transcript
        const [metadata, transcriptText] = await Promise.all([
            getVideoMetadata(videoId),
            fetchTranscript(videoId)
        ]);

        if (!transcriptText || transcriptText.trim().length === 0) {
            return { success: false, error: 'Transcript content is empty.' };
        }

        const maxLength = 50000;
        const truncatedTranscript = transcriptText.length > maxLength
            ? transcriptText.substring(0, maxLength) + '...[truncated]'
            : transcriptText;

        // 3. Generate Structured Notes
        const systemPrompt = `
    You are an expert AI Study Companion. Your goal is to transform YouTube video transcripts into clean, professional, and highly organized study notes.
    
    Structure the output into the following JSON keys:
    - "summary": A high-level executive summary of the video content.
    - "study_notes": Comprehensive notes organized with clear headings. Include "Definitions", "Key Concepts", and "Detailed Explanations".
    - "key_points": A bulleted list of the most important takeaways.
    - "revision_notes": A "Quick Review" section with bite-sized facts and potential exam questions based on the content.
    - "flashcards": An array of objects, each with "question" and "answer" keys. Create 5-10 cards based on the most important facts.

    Formatting Rules:
    - Use clean Markdown for all content (bolding, lists, headings).
    - Ensure the tone is academic yet accessible.
    - If there are specific formulas, dates, or names, highlight them.
    - Do NOT wrap the JSON in markdown code blocks. Return ONLY the raw JSON object.
    `;

        try {
            const completion = await openai.chat.completions.create({
                model: "openai/gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Transcript:\n${truncatedTranscript}` },
                ],
                temperature: 0.5,
                response_format: { type: "json_object" }
            });

            const content = completion.choices[0].message.content;
            if (!content) throw new Error("No content from OpenAI");

            const parsedContent = JSON.parse(content);

            // 4. Save to Database
            const client = await pool.connect();
            try {
                await client.query(
                    `INSERT INTO notes (user_id, video_url, video_title, thumbnail_url, summary, study_notes, key_points, revision_notes, flashcards, transcript)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                    [
                        user.id,
                        videoUrl,
                        metadata.title,
                        metadata.thumbnail_url,
                        parsedContent.summary,
                        parsedContent.study_notes,
                        parsedContent.key_points,
                        parsedContent.revision_notes,
                        JSON.stringify(parsedContent.flashcards || []),
                        transcriptText
                    ]
                );
                revalidatePath('/dashboard/notes-history');
            } finally {
                client.release();
            }

            return { success: true, data: parsedContent };

        } catch (openaiErr: any) {
            console.error("OpenAI/DB Error:", openaiErr);
            const errorMessage = openaiErr.message || 'Failed to generate or save notes.';
            return { success: false, error: errorMessage };
        }

    } catch (error) {
        console.error("General Error:", error);
        return { success: false, error: 'An unexpected error occurred.' };
    }
}

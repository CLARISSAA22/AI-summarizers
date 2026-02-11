'use server';

import OpenAI from 'openai';
import { YoutubeTranscript } from 'youtube-transcript';
import { Innertube, UniversalCache } from 'youtubei.js';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
});

// Helper function to fetch transcript with fallbacks
async function fetchTranscript(videoId: string): Promise<string> {
    console.log(`Attempting to fetch transcript for: ${videoId}`);

    // Strategy 1: youtube-transcript (Fastest, Pure JS)
    try {
        console.log('Strategy 1: Trying youtube-transcript...');
        // Try with 'en' explicitly, then default
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

    // Strategy 3: Python yt-dlp (System command - Command Line)
    // This is the most robust method for local development if python/yt-dlp is installed.
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
        // Output template for yt-dlp
        const outputPath = path.join(tempDir, baseName);

        // Try to use 'python' or 'python3' 
        const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

        // Command to download subs without video using installed yt-dlp module
        const cmd = `${pythonCmd} -m yt_dlp "https://www.youtube.com/watch?v=${videoId}" --skip-download --write-sub --write-auto-sub --sub-lang en,en-US --output "${outputPath}" --no-check-certificates --no-warnings --prefer-free-formats`;

        console.log(`Executing: ${cmd}`);
        await execAsync(cmd);

        const dirFiles = fs.readdirSync(tempDir);
        // Look for any subtitle file (vtt preferred)
        const captionFile = dirFiles.find(f => f.startsWith(baseName) && (f.endsWith('.vtt') || f.endsWith('.ttml') || f.endsWith('.srv3')));

        if (captionFile) {
            const fullPath = path.join(tempDir, captionFile);
            let content = fs.readFileSync(fullPath, 'utf-8');
            try { fs.unlinkSync(fullPath); } catch (e) { /* ignore */ }

            console.log('Strategy 3 Success!');
            // Cleanup VTT
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

    // Strategy 4: youtube-dl-exec (wrapper fallback)
    try {
        console.log('Strategy 4: Trying youtube-dl-exec wrapper...');
        const { default: youtubedl } = await import('youtube-dl-exec');
        const fs = await import('fs');
        const path = await import('path');
        const os = await import('os');

        const url = `https://www.youtube.com/watch?v=${videoId}`;
        const tempDir = os.tmpdir();
        const baseName = `yt-summary-wrapper-${videoId}-${Date.now()}`;
        const outputPath = path.join(tempDir, baseName);

        await youtubedl(url, {
            skipDownload: true,
            writeSub: true,
            writeAutoSub: true,
            subLang: 'en,en-US',
            output: outputPath,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
        });

        const dirFiles = fs.readdirSync(tempDir);
        const captionFile = dirFiles.find(f => f.startsWith(baseName) && (f.endsWith('.vtt') || f.endsWith('.ttml') || f.endsWith('.srv3')));

        if (captionFile) {
            const fullPath = path.join(tempDir, captionFile);
            let content = fs.readFileSync(fullPath, 'utf-8');
            try { fs.unlinkSync(fullPath); } catch (e) { /* ignore */ }

            console.log('Strategy 4 Success!');
            return content
                .replace(/WEBVTT/g, '')
                .replace(/(\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3})/g, '')
                .replace(/(\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}\.\d{3})/g, '')
                .replace(/<[^>]*>/g, '')
                .replace(/\n+/g, ' ')
                .trim();
        }
    } catch (e: any) {
        console.warn(`Strategy 4 failed: ${e.message}`);
    }

    throw new Error('Could not retrieve transcript from any source. The video might not have captions enabled, or serves are blocked.');
}

export async function generateStudyNotes(videoUrl: string) {
    try {
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
        } catch (e) {
            // parsing error
        }

        if (!videoId) {
            // Regex fallback
            const match = videoUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/);
            if (match) {
                videoId = match[1];
            }
        }

        if (!videoId) {
            return { success: false, error: 'Invalid YouTube URL. Please provide a valid link.' };
        }

        // 2. Fetch Transcript
        let transcriptText = '';
        try {
            transcriptText = await fetchTranscript(videoId);
        } catch (err: any) {
            console.error("Transcript Fetch Error:", err);
            return { success: false, error: `Failed to fetch transcript: ${err.message}. Please ensure the video has captions.` };
        }

        if (!transcriptText || transcriptText.trim().length === 0) {
            return { success: false, error: 'Transcript content is empty.' };
        }

        // Truncate if too long (OpenAI token limits)
        const maxLength = 50000;
        const truncatedTranscript = transcriptText.length > maxLength
            ? transcriptText.substring(0, maxLength) + '...[truncated]'
            : transcriptText;

        // 3. Generate Summary with OpenAI


        const systemPrompt = `
    You are an expert AI Study Companion. Your goal is to create beautiful, well-structured, and highly educational study notes from the provided YouTube transcript.
    
    Output must be in valid Markdown format. Use emojis to make it engaging.
    
    Structure:
    # 📚 [Video Title] 

    ## 🎯 Executive Summary
    (A concise, high-level summary of the video's core message. 2-3 sentences.)

    ## 🔑 Key Concepts
    (The most important takeaways. Use bullet points.)

    ## 📝 Detailed Study Notes
    (Deep dive into the content. Use bolding for key terms. Break down complex topics into sub-sections if necessary.)

    ## 💡 Actionable Insights / Real-World Application
    (How can the user apply this knowledge?)

    ## 🧠 Quiz Yourself
    (3-5 multiple-choice or short-answer questions to test understanding. Put answers in a collapsible markdown section if possible, or at the very bottom.)

    ---
    *Generated by AI Study Companion*
    `;

        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Here is the transcript:\n\n${truncatedTranscript}` },
                ],
                temperature: 0.5,
            });
            const studyNotes = completion.choices[0].message.content;
            return { success: true, data: studyNotes };
        } catch (openaiErr: any) {
            console.error("OpenAI API Error:", openaiErr);
            throw openaiErr; // rethrow to be caught by outer block
        }

    } catch (error) {
        console.error("General Error:", error);
        return { success: false, error: 'An unexpected error occurred while generating notes.' };
    }
}

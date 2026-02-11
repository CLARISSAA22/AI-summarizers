
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Mock OpenAI to avoid API calls, we just want to test transcript fetching
const mockOpenAI = {
    chat: {
        completions: {
            create: async () => ({ choices: [{ message: { content: "Mocked Notes" } }] })
        }
    }
};

// We need to import the real function but maybe mock internal calls if possible? 
// No, let's just use the real function and see the logs. 
// I'll import the function from the compiled server file or just copy the logic effectively.
// Simpler: Import the actual action file.
// Note: importing 'use server' files in a standalone script might be tricky depending on the bundler.
// Let's copy the fetchTranscript logic here to ensure it runs as a standalone node script without Next.js server constraints specificities interfering with the *test* (though they might be part of the problem, usually logic is logic).
// Actually, I can just copy the `fetchTranscript` function logic to be 100% sure I'm testing the code logic and not environment quirks.

import { YoutubeTranscript } from 'youtube-transcript';
import { Innertube, UniversalCache } from 'youtubei.js';
const youtubedl = require('youtube-dl-exec');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function fetchTranscript(videoId: string) {
    console.log(`Debug: Attempting to fetch transcript for: ${videoId}`);

    // Strategy 1: youtube-transcript
    try {
        console.log('Strategy 1: Trying youtube-transcript...');
        // Try with 'en' explicitly
        const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });
        console.log(`Strategy 1 result length: ${transcriptItems ? transcriptItems.length : 'null'}`);
        if (transcriptItems && transcriptItems.length > 0) {
            console.log('Strategy 1 Success!');
            return transcriptItems.map(item => item.text).join(' ');
        }
    } catch (e: any) {
        console.log(`Strategy 1 failed: ${e.message}`);
    }

    // Strategy 2: youtubei.js
    try {
        console.log('Strategy 2: Trying youtubei.js...');
        const youtube = await Innertube.create({ cache: new UniversalCache(false), generate_session_locally: true });
        const info = await youtube.getInfo(videoId);
        const transcriptData = await info.getTranscript();

        if (transcriptData?.transcript?.content?.body?.initial_segments) {
            const segments = transcriptData.transcript.content.body.initial_segments;
            console.log(`Strategy 2 segments found: ${segments.length}`);
            const text = segments.map((s: any) => s.snippet.text).join(' ');
            console.log('Strategy 2 Success!');
            return text;
        } else {
            console.log('Strategy 2: No initial_segments found in transcript data.');
        }
    } catch (e: any) {
        console.log(`Strategy 2 failed: ${e.message}`);
    }

    // Strategy 3: youtube-dl-exec
    try {
        console.log('Strategy 3: Trying youtube-dl-exec...');
        const url = `https://www.youtube.com/watch?v=${videoId}`;
        const tempDir = os.tmpdir();
        const baseName = `yt-summary-${videoId}-${Date.now()}`;
        const outputPath = path.join(tempDir, baseName);

        console.log(`Strategy 3: Output path: ${outputPath}`);

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
            console.log(`Strategy 3: Found caption file: ${captionFile}`);
            const fullPath = path.join(tempDir, captionFile);
            let content = fs.readFileSync(fullPath, 'utf-8');
            try { fs.unlinkSync(fullPath); } catch (e) { /* ignore */ }
            console.log('Strategy 3 Success!');
            return content.substring(0, 100) + '...';
        } else {
            console.log('Strategy 3: No caption file found after execution.');
        }
    } catch (e: any) {
        console.log(`Strategy 3 failed: ${e.message}`);
    }

    console.log('All strategies failed.');
}

fetchTranscript('dGby9BH9bMc');


import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

console.log('API Key present:', !!process.env.OPENAI_API_KEY);
console.log('Base URL present:', !!process.env.OPENAI_BASE_URL);
console.log('Base URL:', process.env.OPENAI_BASE_URL);

if (!process.env.OPENAI_API_KEY) {
    console.error('Missing OPENAI_API_KEY. Please check .env.local');
    process.exit(1);
}

async function verify() {
    // Dynamic import to ensure env vars are loaded first
    const { generateStudyNotes } = await import('./src/app/actions/summarize');

    const videoId = 'dGby9BH9bMc'; // User provided video
    console.log(`Testing generateStudyNotes with video ID: ${videoId}`);

    try {
        const result = await generateStudyNotes(`https://www.youtube.com/watch?v=${videoId}`);
        if (result.success) {
            console.log('SUCCESS: Study notes generated!');
            console.log('Preview:', result.data?.substring(0, 200));
        } else {
            console.error('FAILURE:', result.error);
        }
    } catch (err) {
        console.error('ERROR calling function:', err);
    }
}

verify();

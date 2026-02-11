import { YoutubeTranscript } from 'youtube-transcript';

async function test() {
    const videoId = 'SqcY0GlETPk'; // React Native Tutorial
    console.log(`Testing video ID: ${videoId} with youtube-transcript`);

    try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        console.log('Transcript fetched successfully');
        console.log(transcript.slice(0, 5)); // Print first 5 items
    } catch (err) {
        console.error('Error fetching transcript:', err);
    }
}

test();

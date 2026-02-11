import { Innertube } from 'youtubei.js';

async function verify() {
    const videoId = 'dGby9BH9bMc';
    console.log(`Testing youtubei.js (ANDROID) for transcript with video ID: ${videoId}`);

    try {
        console.log('Creating Innertube with ANDROID client...');
        const youtube = await Innertube.create({
            lang: 'en',
            location: 'US',
            // @ts-ignore - 'ANDROID' is a valid client type string at runtime
            client_type: 'ANDROID'
        });

        console.log('Fetching video info...');
        const info = await youtube.getInfo(videoId);

        console.log('Video Info fetched. checking for transcript data...');

        try {
            const transcriptData = await info.getTranscript();
            console.log('Transcript fetched successfully!');

            if (transcriptData.transcript && transcriptData.transcript.content) {
                // The content might be in segments
                console.log('Transcript has content.');
                // Mapping segments to text
                const text = transcriptData.transcript.content.body?.initial_segments.map((seg: any) => seg.snippet.text).join(' ');
                if (text) {
                    console.log('Snippet:', text.substring(0, 200));
                } else {
                    // Try simpler structure if different
                    console.log('Structure might be different:', JSON.stringify(transcriptData.transcript, null, 2).substring(0, 500));
                }
            } else {
                console.log('Transcript object found but content structure unclear.');
            }

        } catch (transcriptError: any) {
            console.error('Error fetching transcript from info:', transcriptError.message);
        }

    } catch (err: any) {
        console.error('General Error:', err.message);
    }
}

verify();

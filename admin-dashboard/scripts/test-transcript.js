
const { Innertube } = require('youtubei.js');

async function test() {
    const videoId = 'SqcY0GlETPk'; // React Native Tutorial
    console.log(`Testing video with Innertube: ${videoId}`);

    try {
        const youtube = await Innertube.create();
        const info = await youtube.getInfo(videoId);

        try {
            const transcriptData = await info.getTranscript();

            if (!transcriptData?.transcript?.content?.body?.initial_segments) {
                console.log("No transcript found (structure mismatch)");
                return;
            }

            const segments = transcriptData.transcript.content.body.initial_segments;
            console.log(`Found ${segments.length} segments.`);
            console.log("First segment:", segments[0].snippet.text);

            const fullText = segments.map(s => s.snippet.text).join(' ');
            console.log("Total length:", fullText.length);
        } catch (e) {
            console.log("Error getting transcript:", e.message);
        }

    } catch (e) {
        console.log("Error:", e.message);
    }
}

test();

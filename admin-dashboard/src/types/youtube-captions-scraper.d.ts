declare module 'youtube-captions-scraper' {
    export interface SubtitleOptions {
        videoID: string;
        lang?: string;
    }

    export interface Subtitle {
        text: string;
        start: number;
        dur: number;
    }

    export function getSubtitles(options: SubtitleOptions): Promise<Subtitle[]>;
}

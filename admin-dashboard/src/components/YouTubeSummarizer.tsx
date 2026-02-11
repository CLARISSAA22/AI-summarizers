'use client';

import { useState } from 'react';
import { generateStudyNotes } from '@/app/actions/summarize';
import { Loader2, Youtube, BookOpen, Sparkles, AlertCircle, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function YouTubeSummarizer() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!url.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await generateStudyNotes(url);
            if (response.success && response.data) {
                setResult(response.data);
            } else {
                setError(response.error || 'Failed to generate notes');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (result) {
            navigator.clipboard.writeText(result);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6">
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 rounded-3xl shadow-2xl border border-white/10">

                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

                <div className="relative p-8 md:p-12 space-y-8">

                    <div className="text-center space-y-4">
                        <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                            AI Study Companion
                        </h2>
                        <p className="text-purple-200 text-lg max-w-2xl mx-auto">
                            Transform any YouTube video into clear, organized study notes in seconds.
                        </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 md:p-4 border border-white/20 shadow-xl">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-1 w-full">
                                <Youtube className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-400 w-6 h-6" />
                                <input
                                    type="text"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="Paste YouTube Video URL here..."
                                    className="w-full pl-12 pr-4 py-4 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all font-medium"
                                />
                            </div>
                            <button
                                onClick={handleGenerate}
                                disabled={loading || !url}
                                className={`w-full md:w-auto px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2
                  ${loading
                                        ? 'bg-gray-600 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-400 hover:to-violet-500 hover:shadow-purple-500/25'
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin w-5 h-5" />
                                        <span>Analyzing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        <span>Generate Notes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 backdrop-blur-md border border-red-500/50 text-white px-6 py-4 rounded-xl flex items-center gap-3 animate-slideIn">
                            <AlertCircle className="w-5 h-5 text-red-300" />
                            <p>{error}</p>
                        </div>
                    )}

                    {result && (
                        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-purple-600" />
                                    <h3 className="text-gray-800 font-bold">Study Notes</h3>
                                </div>
                                <button
                                    onClick={copyToClipboard}
                                    className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors"
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <div className="p-8 text-black prose prose-purple max-w-none prose-headings:font-bold prose-headings:text-black prose-h1:text-3xl prose-h2:text-xl prose-p:text-black prose-li:text-black prose-strong:text-black prose-blockquote:text-black [&_*]:text-black">
                                <ReactMarkdown>{result}</ReactMarkdown>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

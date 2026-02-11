'use client';

import { useState } from 'react';
import { generateStudyNotes } from '@/app/actions/summarize';
import { Loader2, Youtube, BookOpen, Sparkles, AlertCircle, Copy, Check, Download, List, FileText, Brain, Layout } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import FlashcardPlayer from './FlashcardPlayer';

interface StudyData {
    summary: string;
    study_notes: string;
    key_points: string;
    revision_notes: string;
    flashcards?: Array<{ question: string; answer: string }>;
}

export default function YouTubeSummarizer() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<StudyData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<keyof StudyData>('summary');
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!url.trim()) return;

        setLoading(true);
        setError(null);
        setData(null);

        try {
            const response = await generateStudyNotes(url);
            if (response.success && response.data) {
                setData(response.data);
                setActiveTab('summary');
            } else {
                setError(response.error || 'Failed to generate notes');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (data) {
            const text = data[activeTab];
            if (typeof text !== 'string') return;
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const downloadNotes = () => {
        if (!data) return;
        const content = `# AI Study Notes\n\n## Summary\n${data.summary}\n\n## Key Points\n${data.key_points}\n\n## Study Notes\n${data.study_notes}\n\n## Revision Notes\n${data.revision_notes}`;
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'study-notes.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const tabs: { id: keyof StudyData; label: string; icon: any }[] = [
        { id: 'summary', label: 'Summary', icon: FileText },
        { id: 'key_points', label: 'Key Points', icon: List },
        { id: 'study_notes', label: 'Study Notes', icon: BookOpen },
        { id: 'revision_notes', label: 'Revision', icon: Brain },
    ];

    return (
        <div className="w-full max-w-5xl mx-auto p-4 md:p-6">
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 rounded-3xl shadow-2xl border border-white/10">

                {/* Decorative background elements with smoother animations */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-white/5 to-transparent"></div>

                <div className="relative p-6 md:p-10 space-y-8">

                    <div className="text-center space-y-3">
                        <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                            AI Study Companion
                        </h2>
                        <p className="text-purple-200 text-base md:text-lg max-w-2xl mx-auto">
                            Transform any YouTube video into clear, organized study notes.
                        </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 md:p-3 border border-white/20 shadow-xl">
                        <div className="flex flex-col md:flex-row gap-3 items-center">
                            <div className="relative flex-1 w-full">
                                <Youtube className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-500 w-5 h-5" />
                                <input
                                    type="text"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="Paste YouTube Video URL..."
                                    className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all font-medium"
                                />
                            </div>
                            <button
                                onClick={handleGenerate}
                                disabled={loading || !url}
                                className={`w-full md:w-auto px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2
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
                                        <span>Generate</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 backdrop-blur-md border border-red-500/50 text-white px-5 py-3 rounded-xl flex items-center gap-3 animate-slideIn">
                            <AlertCircle className="w-5 h-5 text-red-300" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {data && (
                        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden animate-slideUp min-h-[500px] flex flex-col">
                            {/* Tabs */}
                            {['summary', 'notes', 'key_points', 'flashcards', 'revision_notes'].map((tabId) => (
                                <button
                                    key={tabId}
                                    onClick={() => setActiveTab(tabId as keyof StudyData)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap
                        ${activeTab === tabId
                                            ? 'bg-purple-600 text-white shadow-md'
                                            : 'text-gray-600 hover:bg-gray-200/50'
                                        }`}
                                >
                                    {tabId === 'summary' && <FileText className="w-4 h-4" />}
                                    {tabId === 'notes' && <BookOpen className="w-4 h-4" />}
                                    {tabId === 'key_points' && <List className="w-4 h-4" />}
                                    {tabId === 'flashcards' && <Layout className="w-4 h-4" />}
                                    {tabId === 'revision_notes' && <Brain className="w-4 h-4" />}
                                    <span className="capitalize">{tabId.replace('_', ' ')}</span>
                                </button>
                            ))}

                            {/* Content & Actions */}
                            <div className="flex-1 flex flex-col">
                                <div className="flex justify-end gap-2 p-3 border-b border-gray-100 bg-white/50">
                                    <button
                                        onClick={copyToClipboard}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                    >
                                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                        {copied ? 'Copied' : 'Copy'}
                                    </button>
                                    <button
                                        onClick={downloadNotes}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Download
                                    </button>
                                </div>

                                <div className="p-6 md:p-8 overflow-y-auto max-h-[600px] bg-white custom-scrollbar">
                                    {activeTab === 'flashcards' ? (
                                        <div className="py-8">
                                            <FlashcardPlayer cards={data.flashcards || []} />
                                        </div>
                                    ) : (
                                        <div className="prose prose-purple max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-p:text-gray-800 prose-li:text-gray-800">
                                            <ReactMarkdown>{(data[activeTab] as string) || ''}</ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}


'use client';

import { useState } from 'react';
import { FileText, List, BookOpen, Brain, Check, Copy, Download, Layout } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import FlashcardPlayer from './FlashcardPlayer';

interface NoteData {
    summary: string;
    key_points: string;
    study_notes: string;
    revision_notes: string;
    flashcards?: Array<{ question: string; answer: string }>;
}

export default function NoteContent({ data }: { data: NoteData }) {
    const [activeTab, setActiveTab] = useState<string>('summary');
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        if (data) {
            const text = (data as any)[activeTab];
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

    const tabs = [
        { id: 'summary', label: 'Summary', icon: FileText },
        { id: 'key_points', label: 'Key Points', icon: List },
        { id: 'study_notes', label: 'Study Notes', icon: BookOpen },
        { id: 'flashcards', label: 'Flashcards', icon: Layout },
        { id: 'revision_notes', label: 'Revision', icon: Brain },
    ];

    return (
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">
            {/* Tabs */}
            <div className="flex overflow-x-auto bg-gray-50/80 border-b border-gray-200 p-2 gap-2 hide-scrollbar">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap
                ${activeTab === tab.id
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-200/50'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

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

                <div className="p-6 md:p-8 overflow-y-auto max-h-[700px] bg-white custom-scrollbar">
                    {activeTab === 'flashcards' ? (
                        <div className="py-8">
                            <FlashcardPlayer cards={data.flashcards || []} />
                        </div>
                    ) : (
                        <div className="prose prose-purple max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-p:text-gray-800 prose-li:text-gray-800">
                            <ReactMarkdown>{(data as any)[activeTab] || ''}</ReactMarkdown>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

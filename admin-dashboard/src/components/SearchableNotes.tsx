
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Clock, PlayCircle, Search, SlidersHorizontal } from 'lucide-react';

interface Note {
    id: number;
    video_title: string;
    thumbnail_url: string;
    created_at: string;
    video_url: string;
}

export default function SearchableNotes({ initialNotes }: { initialNotes: Note[] }) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredNotes = initialNotes.filter(note =>
        note.video_title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search your notes by title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
                    />
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl text-gray-600 font-medium hover:bg-gray-50 transition-colors shadow-sm">
                    <SlidersHorizontal className="w-5 h-5" />
                    Filters
                </button>
            </div>

            {filteredNotes.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                        <Search className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900">No matching notes found</h3>
                    <p className="mt-2 text-gray-500 max-w-sm mx-auto">
                        Try a different search term or generate new notes.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNotes.map((note) => (
                        <Link href={`/dashboard/notes-history/${note.id}`} key={note.id} className="group block h-full">
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 h-full flex flex-col overflow-hidden transform group-hover:-translate-y-1">
                                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                                    {note.thumbnail_url ? (
                                        <img
                                            src={note.thumbnail_url}
                                            alt={note.video_title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-indigo-50 font-bold text-indigo-200">
                                            NO PREVIEW
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="font-bold text-gray-900 text-lg line-clamp-2 mb-3 group-hover:text-indigo-600 transition-colors">
                                        {note.video_title || 'Untitled Video'}
                                    </h3>

                                    <div className="mt-auto flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-50 uppercase tracking-widest font-semibold">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4" />
                                            <span>{new Date(note.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

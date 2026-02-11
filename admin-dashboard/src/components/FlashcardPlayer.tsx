
'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface Flashcard {
    question: string;
    answer: string;
}

export default function FlashcardPlayer({ cards }: { cards: Flashcard[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    if (!cards || cards.length === 0) return (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">No flashcards available for this video.</p>
        </div>
    );

    const nextCard = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % cards.length);
        }, 150);
    };

    const prevCard = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
        }, 150);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center justify-between text-sm font-bold text-gray-400 uppercase tracking-widest px-4">
                <span>Card {currentIndex + 1} of {cards.length}</span>
                <button
                    onClick={() => { setCurrentIndex(0); setIsFlipped(false); }}
                    className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                </button>
            </div>

            <div
                className="relative h-[400px] w-full perspective-1000 cursor-pointer group"
                onClick={() => setIsFlipped(!isFlipped)}
            >
                <div className={`relative w-full h-full transition-all duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden bg-white rounded-[2.5rem] border-2 border-gray-100 shadow-xl flex flex-col items-center justify-center p-12 text-center group-hover:border-indigo-100 group-hover:shadow-indigo-50 transition-all">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-6 bg-indigo-50 px-3 py-1 rounded-full">Question</span>
                        <h3 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
                            {cards[currentIndex].question}
                        </h3>
                        <p className="mt-8 text-sm font-bold text-gray-300 uppercase tracking-widest">Click to reveal answer</p>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-indigo-600 rounded-[2.5rem] shadow-xl flex flex-col items-center justify-center p-12 text-center text-white">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200 mb-6 bg-white/10 px-3 py-1 rounded-full">Answer</span>
                        <div className="text-lg md:text-xl font-bold leading-relaxed whitespace-pre-wrap">
                            {cards[currentIndex].answer}
                        </div>
                        <p className="mt-8 text-sm font-bold text-indigo-300 uppercase tracking-widest">Click to see question</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center gap-6">
                <button
                    onClick={(e) => { e.stopPropagation(); prevCard(); }}
                    className="p-5 bg-white border-2 border-gray-100 rounded-3xl text-gray-400 hover:text-indigo-600 hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-50 transition-all active:scale-90"
                >
                    <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); nextCard(); }}
                    className="p-5 bg-white border-2 border-gray-100 rounded-3xl text-gray-400 hover:text-indigo-600 hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-50 transition-all active:scale-90"
                >
                    <ChevronRight className="w-8 h-8" />
                </button>
            </div>

            <style jsx global>{`
                .perspective-1000 { perspective: 1000px; }
                .preserve-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
            `}</style>
        </div>
    );
}

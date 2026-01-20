import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Deck, Flashcard } from '../types';
import { mirrorService } from '../services/mirrorService';
import { ArrowLeft, RotateCcw, Check, X, ExternalLink, Share2 } from 'lucide-react';
import clsx from 'clsx';
import { shuffleArray } from '../utils/helpers';
import { CARD_TRANSITION_DELAY } from '../utils/constants';

interface StudySessionProps {
  deck: Deck;
  onExit: () => void;
  isBroadcasting?: boolean;
}

const StudySession: React.FC<StudySessionProps> = ({ deck, onExit, isBroadcasting = false }) => {
  // We manage a queue of cards.
  const [queue, setQueue] = useState<Flashcard[]>([]);
  const [completed, setCompleted] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });
  const lastBroadcastCard = useRef<string | null>(null);

  useEffect(() => {
    // Shuffle cards on init using Fisher-Yates algorithm
    const shuffled = shuffleArray(deck.cards);
    setQueue(shuffled);
  }, [deck]);

  const currentCard = queue[currentCardIndex];
  const progress = useMemo(() =>
    Math.round(((completed.length) / deck.cards.length) * 100),
    [completed.length, deck.cards.length]
  );

  // Optimized broadcast - only when card changes or broadcasting is enabled
  useEffect(() => {
    if (isBroadcasting && currentCard && lastBroadcastCard.current !== currentCard.id) {
      lastBroadcastCard.current = currentCard.id;
      mirrorService.broadcast({
        type: 'SYNC',
        deckTitle: deck.title,
        currentCard: currentCard,
        isFlipped: isFlipped,
        progress: progress,
        totalCards: deck.cards.length
      });
    }
  }, [isBroadcasting, currentCard, isFlipped, progress, deck.title, deck.cards.length]);

  const handleCardResult = (known: boolean) => {
    setIsFlipped(false);

    // Small delay to allow flip back animation if needed, but usually we just slide
    setTimeout(() => {
      if (known) {
        setSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }));
        setCompleted(prev => [...prev, currentCard]);
        // Remove from queue logic effectively handled by index increment or filter
        // For this simple version, we move index forward
        if (currentCardIndex < queue.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
        } else {
            // End of current queue
            // If we had a real spaced repetition, we'd re-queue the unknown ones
            // For now, simple finish
        }
      } else {
        setSessionStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
        // Move card to end of queue to review again in this session (Selective Elimination simulation)
        const newQueue = [...queue];
        const card = newQueue.splice(currentCardIndex, 1)[0];
        newQueue.push(card);
        setQueue(newQueue);
        // Don't increment index, effectively showing next card which slid into this slot
      }
    }, CARD_TRANSITION_DELAY);
  };

  if (!currentCard || completed.length === deck.cards.length) {
    if (isBroadcasting) {
        mirrorService.broadcast({ type: 'CLOSE' });
    }
    
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
        <h2 className="text-3xl font-bold text-primary">Session Complete!</h2>
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            <div className="bg-green-100 p-4 rounded-2xl">
                <p className="text-green-600 font-bold text-2xl">{sessionStats.correct}</p>
                <p className="text-green-800 text-sm">Mastered</p>
            </div>
            <div className="bg-orange-100 p-4 rounded-2xl">
                <p className="text-orange-600 font-bold text-2xl">{sessionStats.incorrect}</p>
                <p className="text-orange-800 text-sm">Reviewing</p>
            </div>
        </div>
        <button onClick={onExit} className="px-8 py-3 bg-primary text-white rounded-full font-bold shadow-lg">
          Back to Decks
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 z-10">
        <button onClick={onExit} className="p-2 rounded-full hover:bg-black/5 text-text">
          <ArrowLeft />
        </button>
        <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-text opacity-70 flex items-center gap-2">
                {deck.title}
                {isBroadcasting && <Share2 size={12} className="text-green-500 animate-pulse" />}
            </span>
            <div className="w-32 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                <div 
                    className="h-full bg-accent transition-all duration-500" 
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
        <div className="w-10"></div> {/* Spacer for visual balance */}
      </div>

      {/* Card Area */}
      <div className="flex-1 flex items-center justify-center p-6 perspective-1000">
        <div 
          className={clsx(
            "relative w-full max-w-md aspect-[3/4] transition-all duration-500 transform-style-3d cursor-pointer",
            isFlipped ? "rotate-y-180" : ""
          )}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front */}
          <div className="absolute w-full h-full backface-hidden bg-card rounded-3xl shadow-xl border-2 border-black/5 flex flex-col items-center justify-center p-8 text-center">
            <span className="absolute top-6 left-6 px-3 py-1 bg-secondary/20 text-text text-xs rounded-full font-bold uppercase tracking-wide">
                {currentCard.category}
            </span>
            <h3 className="text-2xl font-bold text-text">{currentCard.front}</h3>
            <p className="absolute bottom-6 text-text opacity-40 text-sm animate-pulse">Tap to flip</p>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full backface-hidden bg-card rounded-3xl shadow-xl border-2 border-primary rotate-y-180 flex flex-col items-center justify-center p-8 text-center">
            <div className="flex-1 flex items-center justify-center overflow-y-auto no-scrollbar w-full">
                <p className="text-xl text-text leading-relaxed">{currentCard.back}</p>
            </div>
            
            {currentCard.deepDiveUrl && (
                <a 
                    href={currentCard.deepDiveUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-4 flex items-center gap-2 text-accent text-sm font-bold hover:underline"
                >
                    <ExternalLink size={14} /> Deep Dive
                </a>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 pb-24 flex justify-center gap-6 z-10">
        <button 
          onClick={() => handleCardResult(false)}
          className="flex flex-col items-center gap-2 group"
        >
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center shadow-md group-active:scale-90 transition-transform">
                <RotateCcw size={28} />
            </div>
            <span className="text-xs font-bold text-red-400">Review</span>
        </button>

        <button 
            onClick={() => handleCardResult(true)}
            className="flex flex-col items-center gap-2 group"
        >
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-500 flex items-center justify-center shadow-md group-active:scale-90 transition-transform">
                <Check size={32} />
            </div>
            <span className="text-xs font-bold text-green-500">Mastered</span>
        </button>
      </div>
    </div>
  );
};

export default StudySession;
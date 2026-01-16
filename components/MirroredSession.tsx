import React, { useEffect, useState } from 'react';
import { MirrorPayload } from '../types';
import { mirrorService } from '../services/mirrorService';
import { Wifi, WifiOff, Maximize2 } from 'lucide-react';
import clsx from 'clsx';

interface MirroredSessionProps {
  onExit: () => void;
}

const MirroredSession: React.FC<MirroredSessionProps> = ({ onExit }) => {
  const [state, setState] = useState<MirrorPayload | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Subscribe to updates
    setConnected(true);
    const unsubscribe = mirrorService.subscribe((payload) => {
      if (payload.type === 'CLOSE') {
        setConnected(false);
        setState(null);
      } else {
        setConnected(true);
        setState(payload);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!state || !state.currentCard) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6 bg-black text-white">
        <div className="animate-pulse bg-white/10 p-8 rounded-full">
            <Wifi size={64} className="opacity-50" />
        </div>
        <h2 className="text-3xl font-bold">Waiting for Host...</h2>
        <p className="opacity-60 max-w-md">
            Start a study session on the host device to see it appear here.
        </p>
        <button onClick={onExit} className="mt-8 px-6 py-2 border border-white/20 rounded-full text-sm hover:bg-white/10 transition-colors">
            Exit Mirror Mode
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black text-white relative overflow-hidden transition-colors duration-500">
      
      {/* Header Info */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-20">
        <div>
            <h1 className="text-2xl font-bold opacity-90">{state.deckTitle}</h1>
            <p className="opacity-50 text-sm mt-1">
                Card {state.progress !== undefined && state.totalCards !== undefined ? 
                `${Math.round((state.progress / 100) * state.totalCards)} / ${state.totalCards}` : ''}
            </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
            <Wifi size={16} className="text-green-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Live</span>
        </div>
      </div>

      {/* Main Content - Maximized for TV/Projector */}
      <div className="flex-1 flex items-center justify-center p-12 perspective-1000">
        <div 
          className={clsx(
            "relative w-full max-w-4xl aspect-[16/9] transition-all duration-700 transform-style-3d",
            state.isFlipped ? "rotate-y-180" : ""
          )}
        >
          {/* Front */}
          <div className="absolute w-full h-full backface-hidden bg-white text-black rounded-[3rem] shadow-2xl flex flex-col items-center justify-center p-12 text-center border-8 border-gray-100">
            <span className="mb-8 px-6 py-2 bg-gray-100 text-gray-500 text-xl rounded-full font-bold uppercase tracking-wide">
                {state.currentCard.category}
            </span>
            <h3 className="text-6xl md:text-7xl font-bold leading-tight">{state.currentCard.front}</h3>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full backface-hidden bg-primary text-white rounded-[3rem] shadow-2xl rotate-y-180 flex flex-col items-center justify-center p-16 text-center border-8 border-white/20">
            <div className="flex-1 flex items-center justify-center w-full">
                <p className="text-5xl md:text-6xl font-medium leading-relaxed">{state.currentCard.back}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 w-full text-center opacity-30 text-sm">
        Mirrored Session • Kaizen8
      </div>
    </div>
  );
};

export default MirroredSession;
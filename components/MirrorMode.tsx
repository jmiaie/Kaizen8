import React, { useState } from 'react';
import { QrCode, Share2, Users, Monitor, Smartphone, Play, ExternalLink, ArrowLeft, Tv, UserPlus, Cast } from 'lucide-react';
import { Deck } from '../types';
import clsx from 'clsx';

interface MirrorModeProps {
    onEnableBroadcasting: () => void;
    onJoinSession: () => void;
    isBroadcasting: boolean;
}

type MirrorType = 'screen' | 'buddy';
type Step = 'type-select' | 'role-select' | 'host-setup' | 'join-setup';

const MirrorMode: React.FC<MirrorModeProps> = ({ onEnableBroadcasting, onJoinSession, isBroadcasting }) => {
    const [mirrorType, setMirrorType] = useState<MirrorType | null>(null);
    const [step, setStep] = useState<Step>('type-select');
    const [joinCode, setJoinCode] = useState('');

    const handleHostStart = () => {
        onEnableBroadcasting();
    };

    const handleJoin = () => {
        if (joinCode.length > 0) {
            onJoinSession();
        }
    };

    const handleTypeSelect = (type: MirrorType) => {
        setMirrorType(type);
        setStep('role-select');
    };

    const handleBack = () => {
        if (step === 'role-select') {
            setStep('type-select');
            setMirrorType(null);
        } else if (step === 'host-setup' || step === 'join-setup') {
            setStep('role-select');
        }
    };

    // If already broadcasting, show status (Global state override)
    if (isBroadcasting) {
        return (
            <div className="h-full flex flex-col p-6 items-center justify-center text-center space-y-8 bg-gradient-to-br from-background to-primary/10">
                <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm space-y-6 animate-fade-in">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 animate-pulse">
                        <Share2 size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-text">You are Live!</h2>
                    <p className="text-text opacity-70">
                        Your session is being broadcasted via {mirrorType === 'buddy' ? 'Buddy Mirror' : 'Screen Mirror'}.
                    </p>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-left">
                        <p className="font-bold mb-1 text-text">Instructions:</p>
                        <ol className="list-decimal pl-4 space-y-1 text-text opacity-80">
                            <li>Go back to <span className="font-bold">Home</span>.</li>
                            <li>Select a Deck.</li>
                            <li>Start Studying.</li>
                        </ol>
                    </div>
                    <button onClick={handleHostStart} className="w-full py-3 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200 transition-colors">
                        Stop Broadcasting
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-6 items-center justify-center text-center space-y-6 bg-gradient-to-br from-background to-secondary/20 overflow-y-auto no-scrollbar relative">
            
            {step !== 'type-select' && (
                <button 
                    onClick={handleBack}
                    className="absolute top-6 left-6 p-2 rounded-full bg-white/50 hover:bg-white text-text transition-colors z-10"
                >
                    <ArrowLeft size={20} />
                </button>
            )}

            {step === 'type-select' && (
                <>
                    <div className="space-y-2 mb-4">
                        <h2 className="text-3xl font-bold text-primary">Connect & Share</h2>
                        <p className="text-text opacity-70">Choose how you want to mirror your session.</p>
                    </div>

                    <div className="grid gap-4 w-full max-w-sm">
                        <button 
                            onClick={() => handleTypeSelect('screen')}
                            className="bg-card p-6 rounded-3xl shadow-lg flex flex-col items-center gap-3 hover:scale-105 transition-transform border-2 border-transparent hover:border-primary group"
                        >
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                <Tv size={32} />
                            </div>
                            <div className="text-center">
                                <span className="block font-bold text-lg text-text">Screen Mirror</span>
                                <span className="text-xs text-text opacity-60">Cast to TV, Tablet, or Projector</span>
                            </div>
                        </button>

                        <button 
                            onClick={() => handleTypeSelect('buddy')}
                            className="bg-card p-6 rounded-3xl shadow-lg flex flex-col items-center gap-3 hover:scale-105 transition-transform border-2 border-transparent hover:border-secondary group"
                        >
                            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-text transition-colors">
                                <Users size={32} />
                            </div>
                            <div className="text-center">
                                <span className="block font-bold text-lg text-text">Buddy Mirror</span>
                                <span className="text-xs text-text opacity-60">Study with friends or family</span>
                            </div>
                        </button>
                    </div>

                    <div className="mt-8 p-4 bg-primary/5 rounded-xl text-xs text-primary max-w-xs">
                        <p className="flex items-center justify-center gap-2 font-bold mb-1"><ExternalLink size={12}/> Quick Tip</p>
                        Open Kaizen8 on the other device to connect.
                    </div>
                </>
            )}

            {step === 'role-select' && mirrorType === 'screen' && (
                <>
                    <div className="space-y-2 mb-4">
                        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full text-primary mb-2">
                            <Tv size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-text">Screen Mirror Setup</h2>
                        <p className="text-text opacity-70">Which device is this?</p>
                    </div>

                    <div className="grid gap-4 w-full max-w-sm">
                        <button 
                            onClick={() => setStep('host-setup')}
                            className="bg-card p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow text-left"
                        >
                            <div className="bg-gray-100 p-3 rounded-xl">
                                <Smartphone size={24} className="text-gray-600" />
                            </div>
                            <div>
                                <span className="block font-bold text-text">I'm the Remote</span>
                                <span className="text-xs text-text opacity-60">Control the session from here</span>
                            </div>
                        </button>

                        <button 
                            onClick={() => setStep('join-setup')}
                            className="bg-card p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow text-left"
                        >
                            <div className="bg-gray-100 p-3 rounded-xl">
                                <Monitor size={24} className="text-gray-600" />
                            </div>
                            <div>
                                <span className="block font-bold text-text">I'm the TV / Display</span>
                                <span className="text-xs text-text opacity-60">Show cards on this screen</span>
                            </div>
                        </button>
                    </div>
                </>
            )}

            {step === 'role-select' && mirrorType === 'buddy' && (
                <>
                    <div className="space-y-2 mb-4">
                        <div className="inline-flex items-center justify-center p-3 bg-secondary/10 rounded-full text-secondary mb-2">
                            <Users size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-text">Buddy Mirror Setup</h2>
                        <p className="text-text opacity-70">Who is leading the study session?</p>
                    </div>

                    <div className="grid gap-4 w-full max-w-sm">
                        <button 
                            onClick={() => setStep('host-setup')}
                            className="bg-card p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow text-left"
                        >
                            <div className="bg-gray-100 p-3 rounded-xl">
                                <Cast size={24} className="text-gray-600" />
                            </div>
                            <div>
                                <span className="block font-bold text-text">I'm Leading</span>
                                <span className="text-xs text-text opacity-60">I'll control the flashcards</span>
                            </div>
                        </button>

                        <button 
                            onClick={() => setStep('join-setup')}
                            className="bg-card p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow text-left"
                        >
                            <div className="bg-gray-100 p-3 rounded-xl">
                                <UserPlus size={24} className="text-gray-600" />
                            </div>
                            <div>
                                <span className="block font-bold text-text">I'm Joining</span>
                                <span className="text-xs text-text opacity-60">Sync with my friend's session</span>
                            </div>
                        </button>
                    </div>
                </>
            )}

            {step === 'host-setup' && (
                <div className="bg-card p-8 rounded-3xl shadow-xl flex flex-col items-center space-y-6 w-full max-w-sm animate-fade-in">
                    <h3 className="text-xl font-bold text-text">
                        {mirrorType === 'screen' ? 'Connect TV' : 'Invite Buddy'}
                    </h3>
                    <div className="bg-white p-4 rounded-xl border-2 border-gray-100">
                         <QrCode size={140} className="text-text" />
                    </div>
                    <p className="text-sm text-text opacity-60 text-center">
                        {mirrorType === 'screen' 
                            ? "Scan this with your TV or Tablet to connect instantly." 
                            : "Have your friend scan this or enter the code below."}
                    </p>
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-bold text-text opacity-40 uppercase tracking-widest">Room Code</span>
                        <span className="text-3xl font-mono font-bold text-primary">KZN-88</span>
                    </div>
                    <button onClick={handleHostStart} className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg animate-bounce-subtle">
                        Start Broadcasting
                    </button>
                </div>
            )}

            {step === 'join-setup' && (
                <div className="bg-card p-8 rounded-3xl shadow-xl flex flex-col items-center space-y-6 w-full max-w-sm animate-fade-in">
                    <h3 className="text-xl font-bold text-text">
                        {mirrorType === 'screen' ? 'TV Setup' : 'Join Buddy'}
                    </h3>
                    
                    <div className="w-full space-y-2">
                        <label className="text-xs font-bold text-text opacity-50 uppercase ml-1">Enter Room Code</label>
                        <input 
                            type="text" 
                            placeholder="KZN-88" 
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            className="w-full text-center text-3xl font-mono tracking-widest p-4 rounded-xl bg-background border-2 border-transparent focus:border-secondary outline-none uppercase transition-all"
                        />
                    </div>
                    
                    <button 
                        onClick={handleJoin} 
                        disabled={joinCode.length < 3}
                        className="w-full py-4 bg-secondary text-text rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:shadow-none transition-all"
                    >
                        Connect Now
                    </button>
                </div>
            )}
        </div>
    );
};

export default MirrorMode;
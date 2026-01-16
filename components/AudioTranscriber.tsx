import React, { useState } from 'react';
import { Mic, FileAudio, Loader2, ArrowRight } from 'lucide-react';
import { transcribeAndSummarizeAudio } from '../services/geminiService';
import { Deck } from '../types';

interface AudioTranscriberProps {
    onDeckCreated: (deck: Deck) => void;
    onCancel: () => void;
}

const AudioTranscriber: React.FC<AudioTranscriberProps> = ({ onDeckCreated, onCancel }) => {
    const [isRecording, setIsRecording] = useState(false); // UI simulation only for this demo
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleProcess = async () => {
        if (!file) return;
        setLoading(true);
        try {
            const result = await transcribeAndSummarizeAudio(file);
            const newDeck: Deck = {
                id: Date.now().toString(),
                title: file.name.split('.')[0] || "Audio Notes",
                description: "Generated from Audio: " + result.text.substring(0, 50) + "...",
                cards: result.flashcards,
                tags: ['Audio', 'Transcription'],
                createdAt: Date.now()
            };
            onDeckCreated(newDeck);
        } catch (e) {
            alert("Error processing audio. Ensure API Key is set.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full p-6 space-y-8">
            <h2 className="text-2xl font-bold text-text">Audio Companion</h2>
            <p className="text-text opacity-70">Record a lecture or upload a voice note to instantly create a study set.</p>

            <div className="flex-1 flex flex-col justify-center gap-6">
                {/* Recording Simulation */}
                <button 
                    className={`w-full py-12 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-colors ${isRecording ? 'border-red-500 bg-red-50' : 'border-secondary bg-white/50'}`}
                    onClick={() => setIsRecording(!isRecording)}
                >
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-secondary text-text'}`}>
                        <Mic size={40} />
                    </div>
                    <span className="font-bold text-text">{isRecording ? 'Tap to Stop' : 'Tap to Record'}</span>
                </button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-background text-gray-500">Or upload file</span>
                    </div>
                </div>

                <label className="w-full py-6 rounded-2xl bg-card shadow-sm flex items-center justify-center gap-3 cursor-pointer border border-transparent hover:border-accent">
                    <FileAudio className="text-accent" />
                    <span className="text-text font-medium truncate max-w-[200px]">
                        {file ? file.name : "Select Audio File"}
                    </span>
                    <input type="file" accept="audio/*" onChange={handleFileChange} className="hidden" />
                </label>
            </div>

            <button 
                disabled={!file || loading}
                onClick={handleProcess}
                className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin" /> : <>Process Audio <ArrowRight /></>}
            </button>
            <button onClick={onCancel} className="w-full text-center text-sm text-text opacity-60">Cancel</button>
        </div>
    );
};

export default AudioTranscriber;
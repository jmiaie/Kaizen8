import React, { useState } from 'react';
import { Mic, FileAudio, Loader2, ArrowRight } from 'lucide-react';
import { transcribeAndSummarizeAudio } from '../services/geminiService';
import { Deck } from '../types';
import { ErrorMessage } from './ui';
import { getUserFriendlyMessage, logError } from '../utils/errorLogger';

interface AudioTranscriberProps {
    onDeckCreated: (deck: Deck) => void;
    onCancel: () => void;
}

const AudioTranscriber: React.FC<AudioTranscriberProps> = ({ onDeckCreated, onCancel }) => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleProcess = async () => {
        if (!file) return;
        setLoading(true);
        setError('');
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
            logError(e, { component: 'AudioTranscriber', action: 'handleProcess' });
            setError(`Error processing audio. ${getUserFriendlyMessage(e)}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full p-6 space-y-8">
            <h2 className="text-2xl font-bold text-text">Audio Companion</h2>
            <p className="text-text opacity-70">Record a lecture or upload a voice note to instantly create a study set.</p>

            <div className="flex-1 flex flex-col justify-center gap-6">
                <label className="w-full py-6 rounded-2xl bg-card shadow-sm flex items-center justify-center gap-3 cursor-pointer border border-transparent hover:border-accent">
                    <FileAudio className="text-accent" />
                    <span className="text-text font-medium truncate max-w-[200px]">
                        {file ? file.name : "Select Audio File"}
                    </span>
                    <input type="file" accept="audio/*" onChange={handleFileChange} className="hidden" />
                </label>
            </div>

            <ErrorMessage message={error} />

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
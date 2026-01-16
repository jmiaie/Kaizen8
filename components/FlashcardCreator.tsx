import React, { useState } from 'react';
import { Camera, Upload, Loader2, Plus, X } from 'lucide-react';
import { generateFlashcardsFromImages } from '../services/geminiService';
import { Deck, Flashcard } from '../types';

interface FlashcardCreatorProps {
  onDeckCreated: (deck: Deck) => void;
  onCancel: () => void;
}

const FlashcardCreator: React.FC<FlashcardCreatorProps> = ({ onDeckCreated, onCancel }) => {
  const [images, setImages] = useState<File[]>([]);
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (images.length === 0 || !topic) {
        setError("Please add at least one image and a topic.");
        return;
    }

    setLoading(true);
    setError(null);

    try {
      const cards = await generateFlashcardsFromImages(images, topic);
      const newDeck: Deck = {
        id: Date.now().toString(),
        title: topic,
        description: `Generated from ${images.length} images`,
        cards: cards,
        tags: ['Generated'],
        createdAt: Date.now()
      };
      onDeckCreated(newDeck);
    } catch (err) {
      setError("Failed to generate cards. Please check your API key and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-6 overflow-y-auto no-scrollbar pb-24">
      <h2 className="text-2xl font-bold mb-6 text-text">Create Magic Deck</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-text opacity-80">What is this deck about?</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Biology Chapter 4, Piano Chords, Python Arrays"
            className="w-full p-4 rounded-xl border-2 border-transparent bg-card text-text focus:border-accent outline-none shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-text opacity-80">Upload Reference Images</label>
          <div className="grid grid-cols-2 gap-4">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden shadow-md">
                <img src={URL.createObjectURL(img)} alt="preview" className="w-full h-full object-cover" />
                <button 
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-lg"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            
            <label className="cursor-pointer flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-secondary hover:border-accent transition-colors bg-white/50">
                <Camera className="text-primary mb-2" size={32} />
                <span className="text-xs text-center px-2 text-text">Tap to Snap or Upload</span>
                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
        </div>

        {error && <div className="text-red-500 bg-red-100 p-3 rounded-lg text-sm">{error}</div>}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" /> Magic in Progress...
            </>
          ) : (
            <>
              <Plus /> Generate Flashcards
            </>
          )}
        </button>
        
        <button onClick={onCancel} className="w-full py-3 text-text opacity-60 hover:opacity-100">
            Cancel
        </button>
      </div>
    </div>
  );
};

export default FlashcardCreator;
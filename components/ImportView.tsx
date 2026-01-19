import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Image as ImageIcon, Film, Loader2, ArrowLeft, Save, Sparkles, X } from 'lucide-react';
import { generateInfographicAndCards } from '../services/geminiService';
import { Deck, InfographicData, Flashcard } from '../types';
import clsx from 'clsx';

interface ImportViewProps {
  onDeckCreated: (deck: Deck) => void;
  onCancel: () => void;
}

const ImportView: React.FC<ImportViewProps> = ({ onDeckCreated, onCancel }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ infographic: InfographicData, flashcards: Flashcard[] } | null>(null);
  const fileUrlsRef = useRef<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const newUrls = newFiles.map(file => URL.createObjectURL(file));
      fileUrlsRef.current = [...fileUrlsRef.current, ...newUrls];
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    // Revoke the URL for the removed file
    if (fileUrlsRef.current[index]) {
      URL.revokeObjectURL(fileUrlsRef.current[index]);
    }
    fileUrlsRef.current = fileUrlsRef.current.filter((_, i) => i !== index);
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Cleanup all object URLs on component unmount
  useEffect(() => {
    return () => {
      fileUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const handleGenerate = async () => {
    if (files.length === 0) return;
    setLoading(true);
    try {
      const data = await generateInfographicAndCards(files);
      setResult(data);
    } catch (e) {
      console.error(e);
      alert("Failed to process files. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    const newDeck: Deck = {
        id: Date.now().toString(),
        title: result.infographic.title,
        description: result.infographic.summary,
        cards: result.flashcards,
        tags: ['Imported', 'Infographic'],
        createdAt: Date.now(),
        infographic: result.infographic
    };
    onDeckCreated(newDeck);
  };

  const getSectionColor = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'green': return 'bg-green-100 text-green-800 border-green-200';
      case 'purple': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'orange': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'red': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (result) {
    return (
      <div className="flex flex-col h-full bg-background relative">
        <div className="p-4 flex items-center justify-between border-b border-gray-200/50">
            <button onClick={() => setResult(null)} className="p-2 rounded-full hover:bg-black/5 text-text">
                <ArrowLeft size={20} />
            </button>
            <h2 className="font-bold text-text">Review & Save</h2>
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full font-bold shadow-md text-sm">
                <Save size={16} /> Save Deck
            </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-6">
            {/* Infographic View */}
            <div className="bg-card rounded-3xl shadow-lg p-8 mb-8 border border-gray-100">
                <div className="text-center mb-8">
                    <span className="inline-block p-2 rounded-xl bg-accent/10 text-accent mb-2">
                        <Sparkles size={24} />
                    </span>
                    <h1 className="text-3xl font-bold text-text mb-2">{result.infographic.title}</h1>
                    <p className="text-text opacity-70 leading-relaxed max-w-lg mx-auto">{result.infographic.summary}</p>
                </div>

                <div className="space-y-6 relative">
                    {/* Timeline Line */}
                    <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-gray-200 z-0 hidden md:block"></div>
                    
                    {result.infographic.sections.map((section, idx) => (
                        <div key={idx} className="relative z-10 flex flex-col md:flex-row gap-4 items-start">
                            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white border-2 border-gray-100 shadow-sm flex items-center justify-center text-2xl z-10">
                                {section.icon || '📌'}
                            </div>
                            <div className={clsx("flex-1 p-5 rounded-2xl border-l-4 shadow-sm", getSectionColor(section.color))}>
                                <h3 className="font-bold text-lg mb-1">{section.title}</h3>
                                <p className="text-sm opacity-90 leading-relaxed">{section.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Generated Cards Preview */}
            <h3 className="font-bold text-text mb-4 text-xl">Generated Flashcards ({result.flashcards.length})</h3>
            <div className="grid grid-cols-1 gap-3 pb-24">
                {result.flashcards.map((card, i) => (
                    <div key={i} className="bg-card p-4 rounded-xl border-l-4 border-secondary shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-text opacity-50">{card.category}</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500 capitalize">{card.difficulty}</span>
                        </div>
                        <p className="font-bold text-text mb-1">{card.front}</p>
                        <p className="text-text opacity-70 text-sm">{card.back}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 pb-24 overflow-y-auto no-scrollbar">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-text mb-2">Import & Learn</h2>
        <p className="text-text opacity-60">Upload documents, images, or screenshots. We'll build an infographic and flashcards for you.</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-6">
        
        {/* Upload Zone */}
        <div className="w-full max-w-md">
            <div className="grid grid-cols-2 gap-4 mb-4">
                {files.map((file, idx) => (
                    <div key={idx} className="relative aspect-video bg-card rounded-xl border border-gray-200 shadow-sm overflow-hidden flex items-center justify-center group">
                        {file.type.startsWith('image/') ? (
                            <img src={fileUrlsRef.current[idx]} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                            <FileText className="text-gray-400" size={32} />
                        )}
                        <button
                            onClick={() => removeFile(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X size={12} />
                        </button>
                        <div className="absolute bottom-0 w-full bg-black/50 text-white text-[10px] p-1 truncate px-2">
                            {file.name}
                        </div>
                    </div>
                ))}
            </div>

            <label className="w-full h-48 rounded-3xl border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center cursor-pointer bg-white/50 gap-4 group">
                <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform text-primary">
                    <Upload size={32} />
                </div>
                <div className="text-center px-4">
                    <p className="font-bold text-text">Click to Upload</p>
                    <p className="text-xs text-text opacity-50 mt-1">Images (PNG, JPG) supported. <br/> Screenshots of Documents/Videos work best.</p>
                </div>
                <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="hidden" 
                />
            </label>

            {/* Simulated options for other file types */}
            <div className="flex gap-2 mt-4 justify-center">
                 <button className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg text-xs font-bold text-text opacity-60 hover:opacity-100 transition-opacity border border-transparent hover:border-gray-200">
                    <FileText size={14} /> Documents
                 </button>
                 <button className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg text-xs font-bold text-text opacity-60 hover:opacity-100 transition-opacity border border-transparent hover:border-gray-200">
                    <Film size={14} /> Videos
                 </button>
            </div>
        </div>
      </div>

      <div className="mt-auto">
        <button
            onClick={handleGenerate}
            disabled={files.length === 0 || loading}
            className="w-full py-4 bg-gradient-to-r from-primary to-accent text-white rounded-2xl font-bold text-lg shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? (
                <>
                <Loader2 className="animate-spin" /> Analyzing Content...
                </>
            ) : (
                <>
                <Sparkles /> Generate Infographic
                </>
            )}
        </button>
        <button onClick={onCancel} className="w-full mt-4 py-2 text-text opacity-50 hover:opacity-100 text-sm font-bold">
            Cancel
        </button>
      </div>
    </div>
  );
};

export default ImportView;
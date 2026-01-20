import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LayoutGrid, Plus, Mic, Tv, User, Search, Play, BookOpen, Compass, X, Moon, Sun, Upload } from 'lucide-react';
import clsx from 'clsx';
import { Deck, ThemeName, AppView } from './types';
import { THEMES, INITIAL_DECKS } from './constants';
import FlashcardCreator from './components/FlashcardCreator';
import StudySession from './components/StudySession';
import AudioTranscriber from './components/AudioTranscriber';
import MirrorMode from './components/MirrorMode';
import MirroredSession from './components/MirroredSession';
import ChallengesView from './components/ChallengesView';
import ImportView from './components/ImportView';

const App: React.FC = () => {
  const [theme, setTheme] = useState<ThemeName>('playful');
  const [lastLightTheme, setLastLightTheme] = useState<ThemeName>('playful');
  const [view, setView] = useState<AppView>('home');
  const [decks, setDecks] = useState<Deck[]>(INITIAL_DECKS);
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Mirroring State
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Apply CSS variables based on theme
  useEffect(() => {
    const root = document.documentElement;
    const t = THEMES[theme];
    root.style.setProperty('--color-primary', t.primary);
    root.style.setProperty('--color-secondary', t.secondary);
    root.style.setProperty('--color-background', t.background);
    root.style.setProperty('--color-card', t.card);
    root.style.setProperty('--color-text', t.text);
    root.style.setProperty('--color-accent', t.accent);
  }, [theme]);

  const handleDeckCreated = useCallback((newDeck: Deck) => {
    setDecks(prev => [newDeck, ...prev]);
    setView('home');
  }, []);

  const startSession = useCallback((deck: Deck) => {
    setActiveDeck(deck);
    setView('study-mode');
  }, []);

  const toggleDarkMode = useCallback(() => {
    if (theme === 'night') {
      setTheme(lastLightTheme);
    } else {
      setLastLightTheme(theme);
      setTheme('night');
    }
  }, [theme, lastLightTheme]);

  const handleThemeChange = useCallback((newTheme: ThemeName) => {
      setTheme(newTheme);
      if (newTheme !== 'night') {
          setLastLightTheme(newTheme);
      }
  }, []);

  const filteredDecks = useMemo(() =>
    decks.filter(deck =>
      deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    ), [decks, searchQuery]
  );

  const renderContent = () => {
    switch (view) {
      case 'create':
        return <FlashcardCreator onDeckCreated={handleDeckCreated} onCancel={() => setView('home')} />;
      case 'transcribe':
        return <AudioTranscriber onDeckCreated={handleDeckCreated} onCancel={() => setView('home')} />;
      case 'import':
        return <ImportView onDeckCreated={handleDeckCreated} onCancel={() => setView('home')} />;
      case 'study-mode':
        if (!activeDeck) return null;
        return <StudySession deck={activeDeck} onExit={() => setView('home')} isBroadcasting={isBroadcasting} />;
      case 'mirror':
        return (
          <MirrorMode 
            isBroadcasting={isBroadcasting}
            onEnableBroadcasting={() => setIsBroadcasting(!isBroadcasting)} 
            onJoinSession={() => setView('mirrored-session')}
          />
        );
      case 'mirrored-session':
        return <MirroredSession onExit={() => setView('home')} />;
      case 'explore':
        return <ChallengesView />;
      case 'home':
      default:
        return (
          <div className="p-6 pb-24 overflow-y-auto h-full no-scrollbar">
            {/* Header / Theme Switcher */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-text">Kaizen8</h1>
                <p className="text-text opacity-60">Continuous improvement daily.</p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Light Theme Flavor Selector */}
                {theme !== 'night' && (
                    <div className="flex bg-card p-1 rounded-full shadow-sm">
                        {(['playful', 'focus'] as ThemeName[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => handleThemeChange(t)}
                            className={clsx(
                            "w-6 h-6 rounded-full mx-1 transition-all",
                            theme === t ? "ring-2 ring-offset-1 ring-primary scale-110" : "opacity-50"
                            )}
                            style={{ backgroundColor: THEMES[t].primary }}
                            title={t.charAt(0).toUpperCase() + t.slice(1)}
                        />
                        ))}
                    </div>
                )}

                {/* Dark Mode Toggle */}
                <button
                    onClick={toggleDarkMode}
                    className="w-10 h-10 rounded-full bg-card shadow-sm flex items-center justify-center text-text hover:bg-secondary/20 transition-colors border border-transparent hover:border-secondary"
                    title={theme === 'night' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    {theme === 'night' ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-primary" />}
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <button 
                onClick={() => setView('create')}
                className="p-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/30 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <Plus size={24} />
                <span className="font-bold text-xs">New Deck</span>
              </button>
              <button 
                onClick={() => setView('transcribe')}
                className="p-4 bg-card text-text rounded-2xl shadow-sm border border-transparent hover:border-accent flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <Mic size={24} className="text-accent" />
                <span className="font-bold text-xs">Audio</span>
              </button>
              <button 
                onClick={() => setView('import')}
                className="p-4 bg-card text-text rounded-2xl shadow-sm border border-transparent hover:border-secondary flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <Upload size={24} className="text-secondary" />
                <span className="font-bold text-xs">Import</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text opacity-40" size={20} />
                <input 
                    type="text" 
                    placeholder="Search decks, tags..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-card rounded-xl text-text placeholder:text-text/40 shadow-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                />
                {searchQuery && (
                    <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text opacity-40 hover:opacity-100"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Decks List */}
            <h2 className="text-xl font-bold text-text mb-4">
                {searchQuery ? `Found ${filteredDecks.length} results` : 'Your Library'}
            </h2>
            
            <div className="space-y-4">
              {filteredDecks.length > 0 ? (
                filteredDecks.map(deck => (
                  <div key={deck.id} className="bg-card p-5 rounded-2xl shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-text font-bold text-lg shrink-0">
                        {deck.title.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-text truncate">{deck.title}</h3>
                        <p className="text-xs text-text opacity-50 truncate">
                            {deck.cards.length} Cards • {deck.tags.join(', ')}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => startSession(deck)}
                      className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                    >
                      <Play size={20} fill="currentColor" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 opacity-50">
                    <p>No decks found matching "{searchQuery}"</p>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  // Bottom Navigation (Hide in immersive modes)
  const showNav = !['study-mode', 'create', 'transcribe', 'mirrored-session', 'import'].includes(view);

  // If we are broadcasting, we might want to highlight the mirror tab or show a banner, 
  // but for now, the status is handled inside the Mirror view or the Study session header.

  return (
    <div className={clsx("h-screen w-full bg-background flex flex-col overflow-hidden mx-auto shadow-2xl relative transition-all duration-300", 
        view === 'mirrored-session' ? "max-w-full sm:my-0 sm:h-screen sm:rounded-none" : "max-w-md sm:rounded-xl sm:my-8 sm:h-[90vh]"
    )}>
        
      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      {showNav && (
        <nav className="absolute bottom-0 w-full h-20 bg-card/90 backdrop-blur-md border-t border-gray-100 flex justify-around items-center px-2 pb-2 z-50">
          <NavButton active={view === 'home'} onClick={() => setView('home')} icon={<LayoutGrid />} label="Home" />
          <NavButton active={view === 'explore'} onClick={() => setView('explore')} icon={<Compass />} label="Explore" />
          <NavButton active={view === 'mirror'} onClick={() => setView('mirror')} icon={<Tv />} label={isBroadcasting ? "Broadcasting" : "Mirror"} />
          <NavButton active={false} onClick={() => {}} icon={<User />} label="Profile" />
        </nav>
      )}
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button onClick={onClick} className={clsx("flex flex-col items-center p-2 transition-colors", active ? "text-primary" : "text-gray-400 hover:text-gray-600")}>
    {React.cloneElement(icon as React.ReactElement, { size: 24, strokeWidth: active ? 3 : 2 })}
    <span className="text-[10px] font-bold mt-1">{label}</span>
  </button>
);

export default App;
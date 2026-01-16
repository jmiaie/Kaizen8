import React, { useState } from 'react';
import { INITIAL_CHALLENGES } from '../constants';
import { Trophy, Users, User, Zap, Briefcase } from 'lucide-react';
import clsx from 'clsx';

const ChallengesView: React.FC = () => {
  const [typeFilter, setTypeFilter] = useState<'all' | 'project' | 'challenge'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  const filteredItems = INITIAL_CHALLENGES.filter(
    (item) => 
      (typeFilter === 'all' || item.type === typeFilter) &&
      (difficultyFilter === 'all' || item.difficulty === difficultyFilter)
  );

  return (
    <div className="flex flex-col h-full p-6 pb-24 overflow-y-auto no-scrollbar">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text mb-2">Explore Library</h2>
        <p className="text-text opacity-60">Projects, challenges, and games to master skills.</p>
      </div>

      {/* Type Filter Tabs */}
      <div className="flex gap-2 mb-3 bg-card p-1 rounded-xl shadow-sm overflow-x-auto no-scrollbar">
        {(['all', 'project', 'challenge'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setTypeFilter(f)}
            className={clsx(
              "px-4 py-2 rounded-lg font-bold text-sm capitalize transition-all whitespace-nowrap flex-1",
              typeFilter === f 
                ? "bg-secondary text-text shadow-sm" 
                : "text-text opacity-50 hover:opacity-100"
            )}
          >
            {f === 'all' ? 'All Types' : f + 's'}
          </button>
        ))}
      </div>

      {/* Difficulty Filter Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-1">
        {(['all', 'easy', 'medium', 'hard'] as const).map((d) => (
          <button
            key={d}
            onClick={() => setDifficultyFilter(d)}
            className={clsx(
              "px-3 py-1.5 rounded-full font-bold text-xs capitalize transition-all whitespace-nowrap border-2",
              difficultyFilter === d 
                ? "bg-primary text-white border-primary" 
                : "bg-transparent text-text border-text/10 hover:border-text/30 opacity-60 hover:opacity-100"
            )}
          >
            {d === 'all' ? 'Any Difficulty' : d}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item.id} className="bg-card p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group border-2 border-transparent hover:border-secondary/20">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center text-3xl shadow-inner">
                  {item.icon}
                </div>
                <div className="flex gap-2">
                  <span className={clsx(
                      "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                      item.type === 'project' ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"
                  )}>
                      {item.type}
                  </span>
                  <span className={clsx(
                    "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                    item.difficulty === 'easy' ? "bg-green-100 text-green-600" :
                    item.difficulty === 'medium' ? "bg-yellow-100 text-yellow-600" :
                    "bg-red-100 text-red-600"
                  )}>
                      {item.difficulty}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-text mb-1">{item.title}</h3>
              <p className="text-sm text-text opacity-60 mb-6 leading-relaxed">
                  {item.description}
              </p>

              <div className="flex gap-2 mt-auto">
                  {(item.mode === 'solo' || item.mode === 'both') && (
                      <button className="flex-1 py-2 px-3 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2">
                          <User size={14} /> Solo
                      </button>
                  )}
                  {(item.mode === 'multi' || item.mode === 'both') && (
                      <button className="flex-1 py-2 px-3 bg-secondary/20 text-text hover:bg-secondary rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2">
                          <Users size={14} /> Together
                      </button>
                  )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 opacity-50 flex flex-col items-center">
             <Briefcase size={48} className="mb-2 opacity-50"/>
             <p>No challenges found matching these filters.</p>
             <button 
                onClick={() => { setTypeFilter('all'); setDifficultyFilter('all'); }}
                className="mt-4 text-primary font-bold text-sm hover:underline"
             >
                Clear Filters
             </button>
          </div>
        )}
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-accent to-primary rounded-2xl text-white text-center shadow-lg">
        <Zap className="mx-auto mb-2" size={32} />
        <h3 className="font-bold text-lg">Suggest a Challenge</h3>
        <p className="text-white/80 text-sm mb-4">Have a great learning game idea?</p>
        <button className="px-4 py-2 bg-white text-primary rounded-full text-sm font-bold shadow-sm">
            Submit Idea
        </button>
      </div>
    </div>
  );
};

export default ChallengesView;
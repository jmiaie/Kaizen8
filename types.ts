import React from 'react';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  deepDiveUrl?: string; // For "Deep Dive" feature
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  cards: Flashcard[];
  tags: string[]; // e.g., "Music", "Coding", "Spanish"
  createdAt: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'project' | 'challenge';
  mode: 'solo' | 'multi' | 'both'; // "simultaneously" support
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  icon: React.ReactNode | string; 
}

export type ThemeName = 'playful' | 'focus' | 'night';

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  card: string;
  text: string;
  accent: string;
  navBar: string;
}

export interface AudioTranscript {
  id: string;
  text: string;
  summary: string;
  createdAt: number;
}

export interface MirrorPayload {
  type: 'SYNC' | 'CLOSE';
  deckTitle?: string;
  currentCard?: Flashcard;
  isFlipped?: boolean;
  progress?: number;
  totalCards?: number;
}

export type AppView = 'home' | 'deck-view' | 'create' | 'study-mode' | 'transcribe' | 'mirror' | 'explore' | 'mirrored-session';
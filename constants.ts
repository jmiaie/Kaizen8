import { ThemeName, ThemeColors, Deck, Challenge } from './types';

export const THEMES: Record<ThemeName, ThemeColors> = {
  playful: {
    primary: '#8b5cf6', // Violet
    secondary: '#fde047', // Yellow
    background: '#f3f4f6', // Light Gray
    card: '#ffffff',
    text: '#1f2937', // Dark Gray
    accent: '#ec4899', // Pink
    navBar: '#ffffff',
  },
  focus: {
    primary: '#334155', // Slate 700
    secondary: '#94a3b8', // Slate 400
    background: '#f8fafc', // Slate 50
    card: '#ffffff',
    text: '#0f172a', // Slate 900
    accent: '#0ea5e9', // Sky Blue
    navBar: '#f1f5f9',
  },
  night: {
    primary: '#6366f1', // Indigo
    secondary: '#1e293b', // Slate 800
    background: '#0f172a', // Slate 900
    card: '#1e293b', // Slate 800
    text: '#f8fafc', // Slate 50
    accent: '#22d3ee', // Cyan
    navBar: '#020617',
  }
};

export const INITIAL_DECKS: Deck[] = [
  {
    id: '1',
    title: 'Intro to React',
    description: 'Core concepts of React.js including Hooks and Components.',
    tags: ['Coding', 'Engineering'],
    createdAt: Date.now(),
    cards: [
      { id: 'c1', front: 'What is a Hook?', back: 'A function that lets you "hook into" React state and lifecycle features from function components.', category: 'Basics', difficulty: 'medium' },
      { id: 'c2', front: 'What is JSX?', back: 'A syntax extension to JavaScript that looks like HTML.', category: 'Syntax', difficulty: 'easy' },
      { id: 'c3', front: 'UseEffect Dependency Array', back: 'Controls when the effect runs. Empty [] runs once on mount.', category: 'Hooks', difficulty: 'hard' }
    ]
  },
  {
    id: '2',
    title: 'Japanese Phrases',
    description: 'Essential phrases for travel.',
    tags: ['Language', 'Culture'],
    createdAt: Date.now(),
    cards: [
      { id: 'j1', front: 'Hello', back: 'Konnichiwa (こんにちは)', category: 'Greetings', difficulty: 'easy' },
      { id: 'j2', front: 'Thank you', back: 'Arigatou (ありがとう)', category: 'Politeness', difficulty: 'easy' }
    ]
  }
];

export const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: 'ch1',
    title: '30-Day Code Sprint',
    description: 'Complete one algorithm challenge every day. Compare solutions with friends.',
    type: 'challenge',
    mode: 'both',
    difficulty: 'hard',
    category: 'Coding',
    icon: '💻'
  },
  {
    id: 'ch2',
    title: 'Build a Bridge',
    description: 'Engineering project: Design a bridge using limited materials (simulated).',
    type: 'project',
    mode: 'multi',
    difficulty: 'medium',
    category: 'Engineering',
    icon: '🌉'
  },
  {
    id: 'ch3',
    title: 'Piano Scales Racer',
    description: 'How fast can you identify major scales? Speed run against the clock.',
    type: 'challenge',
    mode: 'solo',
    difficulty: 'easy',
    category: 'Music',
    icon: '🎹'
  },
  {
    id: 'ch4',
    title: 'Debate Club AI',
    description: 'Argue a topic against an AI opponent or challenge a friend to a structured debate.',
    type: 'project',
    mode: 'both',
    difficulty: 'hard',
    category: 'Language',
    icon: '🗣️'
  },
  {
    id: 'ch5',
    title: 'Photo Scavenger Hunt',
    description: 'Find real-world objects matching the flashcard descriptions.',
    type: 'challenge',
    mode: 'multi',
    difficulty: 'easy',
    category: 'Fun',
    icon: '📸'
  }
];
/**
 * Utility functions for the Kaizen8 application
 */

/**
 * Maps infographic section colors to Tailwind classes
 */
export const getSectionColor = (color: string): string => {
  switch (color) {
    case 'blue': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'green': return 'bg-green-100 text-green-800 border-green-200';
    case 'purple': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'orange': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'red': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/**
 * Fisher-Yates shuffle algorithm for unbiased array shuffling
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Generates a random room code for mirror mode
 */
export const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'KZN-';
  for (let i = 0; i < 2; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

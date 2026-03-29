/**
 * Error logging utility for consistent error handling across the application
 */

type ErrorContext = {
  component?: string;
  action?: string;
  metadata?: Record<string, unknown>;
};

/**
 * Logs an error with context information
 * In production, this could send errors to a monitoring service
 */
export const logError = (error: unknown, context: ErrorContext = {}): void => {
  const { component, action, metadata } = context;

  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  const logContext = [
    component && `[${component}]`,
    action && `Action: ${action}`,
  ].filter(Boolean).join(' ');

  console.error(
    logContext ? `${logContext} - ${errorMessage}` : errorMessage,
    {
      error: errorMessage,
      stack: errorStack,
      metadata,
      timestamp: new Date().toISOString(),
    }
  );
};

/**
 * Returns a user-friendly error message based on the error type
 */
export const getUserFriendlyMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // Check for common error patterns
    if (error.message.includes('API key') || error.message.includes('apiKey')) {
      return 'Please check your API key configuration.';
    }
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'Network error. Please check your connection and try again.';
    }
    if (error.message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
  }

  return 'An unexpected error occurred. Please try again.';
};

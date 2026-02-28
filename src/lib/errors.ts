export const getUserFriendlyError = (error: any): string => {
  const message = error?.message || '';

  // Authentication errors
  if (message.includes('not authenticated') || message.includes('JWT')) {
    return 'Please sign in to continue';
  }
  if (message.includes('Invalid login credentials')) {
    return 'Invalid email or password';
  }
  if (message.includes('Email not confirmed')) {
    return 'Please verify your email before signing in';
  }
  if (message.includes('already registered')) {
    return 'An account with this email already exists';
  }

  // Network errors
  if (message.includes('network') || message.includes('fetch') || message.includes('Failed to fetch')) {
    return 'Network error. Please check your connection';
  }

  // Rate limiting
  if (error?.status === 429 || message.includes('rate limit')) {
    return 'Too many requests. Please try again later';
  }

  // Default safe message
  console.error('Unhandled error:', error);
  return 'Something went wrong. Please try again';
};

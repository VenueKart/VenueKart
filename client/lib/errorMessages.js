/**
 * Converts technical error messages to user-friendly messages
 */

export const getUserFriendlyError = (error, context = 'general') => {
  const errorMessage = error?.message || error || 'Something went wrong';
  const lowerCaseError = errorMessage.toLowerCase();

  // Authentication errors (401, 403, unauthorized, token-related)
  if (lowerCaseError.includes('401') ||
      lowerCaseError.includes('unauthorized') ||
      lowerCaseError.includes('access token required') ||
      lowerCaseError.includes('token refresh failed') ||
      lowerCaseError.includes('refresh token required') ||
      lowerCaseError.includes('no refresh token available') ||
      lowerCaseError.includes('session expired') ||
      lowerCaseError.includes('token expired') ||
      lowerCaseError.includes('403') ||
      lowerCaseError.includes('forbidden')) {
    return 'Your session has expired. Please sign in again to continue.';
  }

  // Database/Network errors
  if (lowerCaseError.includes('network') ||
      lowerCaseError.includes('fetch') ||
      lowerCaseError.includes('connection') ||
      lowerCaseError.includes('enotfound') ||
      lowerCaseError.includes('timeout')) {
    return 'Please check your internet connection and try again.';
  }

  // Server errors
  if (lowerCaseError.includes('500') ||
      lowerCaseError.includes('internal server error') ||
      lowerCaseError.includes('server error')) {
    return 'Our servers are temporarily busy. Please try again in a few moments.';
  }

  // Authentication context specific errors
  if (context === 'signup') {
    if (lowerCaseError.includes('email') && lowerCaseError.includes('exists')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    if (lowerCaseError.includes('email') && lowerCaseError.includes('invalid')) {
      return 'Please enter a valid email address.';
    }
    if (lowerCaseError.includes('password') && lowerCaseError.includes('weak')) {
      return 'Please choose a stronger password with at least 6 characters.';
    }
    if (lowerCaseError.includes('user type')) {
      return 'Please select whether you are a Customer or Venue Owner.';
    }
    if (lowerCaseError.includes('terms')) {
      return 'Please agree to the terms and conditions to continue.';
    }
  }

  if (context === 'signin') {
    if (lowerCaseError.includes('invalid email or password') ||
        lowerCaseError.includes('invalid credentials') ||
        lowerCaseError.includes('wrong password') ||
        lowerCaseError.includes('incorrect password') ||
        lowerCaseError.includes('authentication failed')) {
      return 'Incorrect email or password. Please try again.';
    }
    if (lowerCaseError.includes('this account uses social login')) {
      return 'This account uses Google sign-in. Please sign in with Google instead.';
    }
    if (lowerCaseError.includes('account not found') ||
        lowerCaseError.includes('user not found')) {
      return 'No account found with this email. Please check your email or sign up.';
    }
    if (lowerCaseError.includes('account not verified')) {
      return 'Please verify your email address before signing in.';
    }
    if (lowerCaseError.includes('account suspended') ||
        lowerCaseError.includes('account blocked')) {
      return 'Your account has been temporarily suspended. Please contact support.';
    }
  }

  if (context === 'otp') {
    if (lowerCaseError.includes('invalid') && lowerCaseError.includes('otp')) {
      return 'The verification code is incorrect. Please check and try again.';
    }
    if (lowerCaseError.includes('expired') && lowerCaseError.includes('otp')) {
      return 'Your verification code has expired. Please request a new one.';
    }
    if (lowerCaseError.includes('too many attempts')) {
      return 'Too many failed attempts. Please wait before trying again.';
    }
    if (lowerCaseError.includes('otp not found')) {
      return 'Please request a new verification code.';
    }
  }

  if (context === 'password-reset') {
    if (lowerCaseError.includes('email') && lowerCaseError.includes('not found')) {
      return 'No account found with this email address.';
    }
    if (lowerCaseError.includes('account not verified')) {
      return 'Please verify your email address first.';
    }
    if (lowerCaseError.includes('password') && lowerCaseError.includes('weak')) {
      return 'Please choose a stronger password with at least 6 characters.';
    }
    if (lowerCaseError.includes('passwords do not match')) {
      return 'Passwords do not match. Please try again.';
    }
  }

  // Google OAuth errors
  if (lowerCaseError.includes('popup')) {
    return 'Please allow pop-ups in your browser and try again.';
  }
  if (lowerCaseError.includes('cancelled') || lowerCaseError.includes('canceled')) {
    return 'Sign-in was cancelled. Please try again.';
  }

  // Rate limiting
  if (lowerCaseError.includes('rate limit') || 
      lowerCaseError.includes('too many requests')) {
    return 'Too many attempts. Please wait a few minutes before trying again.';
  }

  // Generic validation errors
  if (lowerCaseError.includes('validation')) {
    return 'Please check your information and try again.';
  }

  // If it's already a user-friendly message, return as is
  if (errorMessage.length < 100 && 
      !lowerCaseError.includes('error') && 
      !lowerCaseError.includes('failed') && 
      !lowerCaseError.includes('exception')) {
    return errorMessage;
  }

  // Default fallback messages based on context
  const fallbackMessages = {
    signup: 'Unable to create your account right now. Please try again.',
    signin: 'Unable to sign you in right now. Please try again.',
    otp: 'Unable to verify the code right now. Please try again.',
    'password-reset': 'Unable to reset your password right now. Please try again.',
    general: 'Something went wrong. Please try again.'
  };

  return fallbackMessages[context] || fallbackMessages.general;
};

export default getUserFriendlyError;

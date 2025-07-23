import { supabase } from '@/integrations/supabase/client';

/**
 * Get the actual user ID for data queries
 * This handles the phone number based authentication mapping
 */
export const getActualUserId = async (): Promise<string | null> => {
  // First check if we have a mapped user ID in session storage
  const mappedUserId = sessionStorage.getItem('actualUserId');
  if (mappedUserId) {
    return mappedUserId;
  }
  
  // Check if we have a persistent phone to user mapping
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const phoneToUserMapping = localStorage.getItem('phoneToUserId');
    if (phoneToUserMapping) {
      try {
        const mapping = JSON.parse(phoneToUserMapping);
        const actualUserId = Object.values(mapping)[0] as string; // Get the first (and should be only) mapped user ID
        if (actualUserId) {
          // Store in session for faster access
          sessionStorage.setItem('actualUserId', actualUserId);
          return actualUserId;
        }
      } catch (error) {
        console.error('Error parsing phone to user mapping:', error);
      }
    }
  }
  
  // Fallback to current auth user
  return user?.id || null;
};

/**
 * Get current user session
 */
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
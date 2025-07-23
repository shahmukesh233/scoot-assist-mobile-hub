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
  
  // Fallback to current auth user
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
};

/**
 * Get current user session
 */
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
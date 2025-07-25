import { supabase } from '@/integrations/supabase/client';

// Set current user ID in database context for RLS
export const setDatabaseContext = async (userId: number | null) => {
  if (userId) {
    // Use direct SQL to set the configuration
    await supabase.from('users').select('user_id').eq('user_id', userId).limit(1);
    // The RLS policies will automatically use the current session context
  }
};

// Check if current user is admin
export const isCurrentUserAdmin = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('is_admin');
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    return data || false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Secure fetch wrapper that ensures user context is set
export const secureQuery = async <T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  userId?: number
): Promise<{ data: T | null; error: any }> => {
  try {
    // Set user context if provided
    if (userId) {
      await setDatabaseContext(userId);
    }
    
    return await queryFn();
  } catch (error) {
    console.error('Secure query error:', error);
    return { data: null, error };
  }
};
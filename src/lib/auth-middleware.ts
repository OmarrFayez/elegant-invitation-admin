import { supabase } from '@/integrations/supabase/client';

// Set current user ID in database context for RLS
export const setDatabaseContext = async (userId: number | null) => {
  if (userId) {
    await supabase.rpc('set_config', {
      setting: 'app.current_user_id',
      value: userId.toString(),
      is_local: false
    });
  } else {
    // Clear the context
    await supabase.rpc('set_config', {
      setting: 'app.current_user_id', 
      value: '',
      is_local: false
    });
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
import { supabase } from '@/integrations/supabase/client';

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

// Check if user has specific role (placeholder for future implementation)
export const hasRole = async (role: string): Promise<boolean> => {
  try {
    // For now, return false until the database function is implemented
    console.log('hasRole function not yet implemented for role:', role);
    return false;
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
};

// Secure fetch wrapper for authenticated queries
export const secureQuery = async <T>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any }> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { data: null, error: { message: 'User not authenticated' } };
    }
    
    return await queryFn();
  } catch (error) {
    console.error('Secure query error:', error);
    return { data: null, error };
  }
};
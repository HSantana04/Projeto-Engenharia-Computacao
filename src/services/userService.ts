// userService.ts
import { supabase } from '../config/supabaseClient';

const getCurrentUser = async (auth_id: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', auth_id)
    .single();

  if (error) {
    console.error('[userService] getCurrentUser error:', error.message);
    return null;
  }

  return data;
};

const createUser = async (auth_id: string, email: string, name: string) => {
  const { data, error } = await supabase
    .from('users')
    .insert({ auth_id, email, name })
    .select()
    .single();

  if (error) {
    console.error('[userService] createUser error:', error.message);
    return null;
  }

  return data;
};

export default { getCurrentUser, createUser };

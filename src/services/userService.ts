// src/services/userService.ts
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

const updateUserProfile = async (
  userId: string,
  updates: { name?: string; email?: string; bio?: string }
) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('[userService] updateUserProfile error:', error.message);
    return null;
  }

  return data;
};

export default { getCurrentUser, createUser, updateUserProfile };
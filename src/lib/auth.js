import { supabase } from './supabase';

export async function signUp(email, password, username) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });

  if (error) return { success: false, error: error.message };

  if (data.user) {
    await supabase.from('users').insert({
      id:       data.user.id,
      username,
      email,
    });
  }

  return { success: true, data, needsVerification: !data.session };
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin,
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}

export async function getOrCreateProfile(sessionUser) {
  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('id', sessionUser.id)
    .single();

  if (existing) return existing;

  const username = sessionUser.user_metadata?.username
    || `user${Math.floor(10000000 + Math.random() * 90000000)}`;

  const { data: newUser } = await supabase
    .from('users')
    .insert({ id: sessionUser.id, username, email: sessionUser.email })
    .select()
    .single();

  return newUser;
}

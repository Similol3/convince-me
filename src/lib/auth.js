
import { supabase } from "./supabase";

export async function signUp(email, password, username) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (data.user && data.session) {
    const { error: profileError } = await supabase
      .from("users")
      .upsert(
        {
          id: data.user.id,
          username,
          email,
        },
        { onConflict: "id,username" }
      );

    if (profileError) {
      console.error("Profile creation failed:", profileError.message);
    }
  }

  return {
    success: true,
    data,
    needsVerification: !data.session,
  };
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Sign out failed:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "https://convince-me-tau.vercel.app/",
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Session retrieval failed:", error.message);
    return null;
  }

  return data.session;
}

export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

export async function getOrCreateProfile(sessionUser) {
  const { data: existing, error: fetchError } = await supabase
    .from("users")
    .select("*")
    .eq("id", sessionUser.id)
    .maybeSingle();

  if (fetchError) {
    console.error("Profile lookup failed:", fetchError.message);
    return null;
  }

  if (existing) {
    return existing;
  }

  const username =
    sessionUser.user_metadata?.username ||
    `user${Math.floor(10000000 + Math.random() * 90000000)}`;

  const { data: newUser, error: insertError } = await supabase
    .from("users")
    .insert({
      id: sessionUser.id,
      username,
      email: sessionUser.email,
    })
    .select()
    .single();

  if (insertError) {
    console.error("Profile creation failed:", insertError.message);
    return null;
  }

  return newUser;
}

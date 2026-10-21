import { supabase } from './supabase';

// ── Add a friend using their invite code ──────────────────
export async function addFriendByCode(userId, inviteCode) {
  const { data: friendUser, error } = await supabase
    .from('users')
    .select('id, username, avatar')
    .eq('invite_code', inviteCode.toUpperCase())
    .single();

  if (error || !friendUser) {
    return { success: false, error: 'Invite code not found' };
  }

  if (friendUser.id === userId) {
    return { success: false, error: "You can't add yourself" };
  }

  // Check not already friends
  const { data: existing } = await supabase
    .from('friends')
    .select('id')
    .eq('user_id', userId)
    .eq('friend_id', friendUser.id)
    .maybeSingle();

  if (existing) {
    return { success: false, error: 'Already friends' };
  }

  // Create mutual friendship (both directions)
  await supabase.from('friends').insert([
    { user_id: userId, friend_id: friendUser.id },
    { user_id: friendUser.id, friend_id: userId },
  ]);

  return { success: true, friend: friendUser };
}

// ── Get a user's friends list ──────────────────────────────
export async function getFriends(userId) {
  const { data, error } = await supabase
    .from('friends')
    .select('friend_id, streak, users:friend_id (id, username, avatar, avatar_image, is_pro)')
    .eq('user_id', userId);

  if (error) {
    console.error('getFriends error:', error);
    return [];
  }

  return (data || []).map(row => ({
    ...row.users,
    streak: row.streak || 0,
  }));
}

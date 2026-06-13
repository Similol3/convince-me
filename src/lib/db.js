import { supabase } from './supabase';
import { XP } from '../data/levels';

// ── Save a decision to database ───────────────────────────
export async function saveDecision({
  userId, optionA, optionB, winner, loser,
  votesA, votesB, category,
  wasDraw, wasCloseCall,
}) {
  const { data, error } = await supabase
    .from('decisions')
    .insert({
      user_id:       userId,
      option_a:      optionA,
      option_b:      optionB,
      winner,
      loser,
      votes_a:       votesA,
      votes_b:       votesB,
      category,
      was_draw:      wasDraw,
      was_close_call: wasCloseCall,
    });

  if (error) console.error('Save decision error:', error);
  return data;
}

// ── Update user XP, coins, streak ─────────────────────────
export async function updateUserStats({
  userId, xpToAdd, coinsToAdd, wasDraw,
}) {
  // First get current stats
  const { data: user } = await supabase
    .from('users')
    .select('xp, coins, streak, total_decisions, last_decision_date')
    .eq('id', userId)
    .single();

  if (!user) return;

  const today     = new Date().toISOString().split('T')[0];
  const lastDate  = user.last_decision_date;
  const yesterday = new Date(Date.now() - 86400000)
    .toISOString().split('T')[0];

  // Calculate new streak
  let newStreak = user.streak;
  if (lastDate === yesterday) {
    newStreak = user.streak + 1; // continuing streak
  } else if (lastDate !== today) {
    newStreak = 1; // streak reset
  }

  const streakBonus = newStreak > user.streak ? XP.streak : 0;

  await supabase
    .from('users')
    .update({
      xp:                user.xp + xpToAdd + streakBonus,
      coins:             user.coins + coinsToAdd,
      streak:            newStreak,
      total_decisions:   user.total_decisions + 1,
      last_decision_date: today,
    })
    .eq('id', userId);
}

// ── Get user's recent decisions ───────────────────────────
export async function getRecentDecisions(userId) {
  const { data, error } = await supabase
    .from('decisions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) console.error('Get decisions error:', error);
  return data || [];
}

// ── Get or create a user ──────────────────────────────────
export async function getOrCreateUser(username) {
  // Check if exists
  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (existing) return existing;

  // Create new user
  const { data: newUser } = await supabase
    .from('users')
    .insert({ username, email: `${username}@demo.com` })
    .select()
    .single();

  return newUser;
}

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://knjshylkekuvlreimfxh.supabase.co';

const SUPABASE_KEY =
  'sb_publishable_eK6KF88TQnb1P9M0RgiSlg_fs29pPkC';

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

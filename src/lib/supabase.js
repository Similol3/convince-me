import { createClient } from '@supabase/supabase-js';

// Replace these with your actual keys from Supabase dashboard
const SUPABASE_URL = 'https://knjshylkekuvlreimfxh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_eK6KF88TQnb1P9M0RgiSlg_fs29pPkC';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

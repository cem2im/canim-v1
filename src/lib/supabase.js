import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xolpnfcgvmolpbplwcir.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_0NQyr4m_GhJoIKb1ct6zSQ_r_qYNrwM'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

import {createClient} from "@supabase/supabase-js";
const SUPABASE_URL = "https://goglfnipvhnkwcgvwite.supabase.co"
const SUPABASE_KEY = "sb_publishable_3iAIPe7bBgxY1Q92VdM0Ww_UUeB3JXO"

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

console.log(supabase)
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Env Vars')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function check() {
    console.log('Checking Daily Stats...')

    // 1. Get a user
    const { data: { user } } = await supabase.auth.getUser()
    // NOTE: This runs as ANON in node context usually unless we have a token, 
    // but here we are checking PUBLIC rows potentially? 
    // We need to fetch *any* stats.

    // Fetch last 10 entries from daily_post_stats
    const { data: stats, error } = await supabase
        .from('daily_post_stats')
        .select('*')
        .order('date', { ascending: false })
        .limit(10)

    if (error) {
        console.error('Error fetching stats:', error)
    } else {
        console.log('Last 10 Daily Stats Entries:')
        console.table(stats)
    }

    // Fetch posts to compare
    const { data: posts } = await supabase.from('posts').select('id, title, views').limit(5)
    console.log('Sample Posts:')
    console.table(posts)
}

check()

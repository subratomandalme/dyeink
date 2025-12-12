
import { supabase } from '../lib/supabase'
import FingerprintJS from '@fingerprintjs/fingerprintjs'

let fpPromise: Promise<any> | null = null

const getFingerprint = async () => {
    if (!fpPromise) {
        fpPromise = FingerprintJS.load()
    }
    const fp = await fpPromise
    const result = await fp.get()
    return result.visitorId
}

export const voteService = {
    async getVoteStatus(postId: number): Promise<{ hasVoted: boolean; count: number }> {
        const fp = await getFingerprint()

        // Parallel queries: Did I vote? What is total?
        const [{ data: upvotes }, { count }] = await Promise.all([
            supabase
                .from('post_upvotes')
                .select('id')
                .eq('post_id', postId)
                .eq('fingerprint', fp)
                .maybeSingle(),
            supabase
                .from('post_upvotes')
                .select('id', { count: 'exact', head: true })
                .eq('post_id', postId)
        ])

        return {
            hasVoted: !!upvotes,
            count: count || 0
        }
    },

    async toggleVote(postId: number) {
        const fp = await getFingerprint()

        const { data, error } = await supabase.rpc('toggle_vote', {
            post_id_input: postId,
            fingerprint_input: fp
        })

        if (error) {
            console.error('Vote failed:', error)
            throw error
        }

        return data as { has_voted: boolean; count: number }
    }
}

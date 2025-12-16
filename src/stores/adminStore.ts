
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { postService } from '../services/postService'
import { settingsService, type SiteSettings } from '../services/settingsService'
import { supabase } from '../lib/supabase'
import type { Post } from '../types'
interface AdminState {
    posts: Post[] | null
    postsLoading: boolean
    postsLastFetched: number | null
    fetchPosts: (force?: boolean) => Promise<void>
    invalidatePosts: () => void
    deletePostFromCache: (id: number) => void
    settings: SiteSettings | null
    settingsLoading: boolean
    settingsLastFetched: number | null
    fetchSettings: (force?: boolean) => Promise<void>
    updateSettingsInCache: (settings: SiteSettings) => void
    stats: {
        totalViews: number
        totalShares: number
        graphData: any[]
    } | null
    statsLoading: boolean
    statsLastFetched: number | null
    fetchStats: (userId: string, force?: boolean) => Promise<void>
    reset: () => void
}
const CACHE_DURATION = 5 * 60 * 1000
export const useAdminStore = create<AdminState>()(
    persist(
        (set, get) => ({
            posts: null,
            postsLoading: false,
            postsLastFetched: null,
            fetchPosts: async (force = false) => {
                const { posts, postsLastFetched, postsLoading } = get()
                if (postsLoading) return
                const now = Date.now()
                if (!force && posts && postsLastFetched && (now - postsLastFetched < CACHE_DURATION)) {
                    return
                }
                set({ postsLoading: true })
                try {
                    const fetchedPosts = await postService.getPosts()
                    set({
                        posts: fetchedPosts,
                        postsLastFetched: Date.now(),
                        postsLoading: false
                    })
                } catch (error) {
                    console.error('Failed to fetch posts:', error)
                    set({ postsLoading: false })
                }
            },
            invalidatePosts: () => set({ postsLastFetched: null }),
            deletePostFromCache: (id: number) => {
                const { posts } = get()
                if (posts) {
                    set({ posts: posts.filter(p => p.id !== id) })
                }
            },
            settings: null,
            settingsLoading: false,
            settingsLastFetched: null,
            fetchSettings: async (force = false) => {
                const { settings, settingsLastFetched, settingsLoading } = get()
                if (settingsLoading) return
                const now = Date.now()
                if (!force && settings && settingsLastFetched && (now - settingsLastFetched < CACHE_DURATION)) {
                    return
                }
                set({ settingsLoading: true })
                try {
                    const fetchedSettings = await settingsService.getSettings()
                    set({
                        settings: fetchedSettings,
                        settingsLastFetched: Date.now(),
                        settingsLoading: false
                    })
                } catch (error) {
                    console.error('Failed to fetch settings:', error)
                    set({ settingsLoading: false })
                }
            },
            updateSettingsInCache: (newSettings: SiteSettings) => {
                set({ settings: newSettings, settingsLastFetched: Date.now() })
            },
            stats: null,
            statsLoading: false,
            statsLastFetched: null,
            fetchStats: async (userId: string, force = false) => {
                const { stats, statsLastFetched, statsLoading } = get()
                if (statsLoading) return
                const now = Date.now()
                if (!force && stats && statsLastFetched && (now - statsLastFetched < CACHE_DURATION)) {
                    return
                }

                set({ statsLoading: true })
                try {

                    const { data: userPosts, error: postsErr } = await supabase
                        .from('posts')
                        .select('id, views, shares, created_at')
                        .eq('user_id', userId)

                    if (postsErr) throw postsErr

                    const totalViews = userPosts?.reduce((acc: number, p: any) => acc + (p.views || 0), 0) || 0
                    const totalShares = userPosts?.reduce((acc: number, p: any) => acc + (p.shares || 0), 0) || 0
                    const postIds = userPosts?.map((p: any) => p.id) || []


                    const { format } = await import('date-fns')

                    const last7Days: any[] = []
                    for (let i = 6; i >= 0; i--) {
                        const d = new Date()
                        d.setDate(d.getDate() - i)
                        const dateKey = format(d, 'yyyy-MM-dd')
                        last7Days.push({
                            date: dateKey,
                            name: format(d, 'MMM d'),
                            views: 0,
                            shares: 0,
                            published: 0
                        })
                    }

                    const queryDate = last7Days[0].date
                    const mergedGraphData = [...last7Days]


                    if (userPosts) {
                        userPosts.forEach((p: any) => {
                            if (p.created_at) {
                                const dateKey = format(new Date(p.created_at), 'yyyy-MM-dd')
                                const entry = mergedGraphData.find(d => d.date === dateKey)
                                if (entry) {
                                    entry.published += 1
                                }
                            }
                        })
                    }


                    if (postIds.length > 0) {
                        const { data: daily, error: dailyErr } = await supabase
                            .from('daily_post_stats')
                            .select('date, views, shares')
                            .in('post_id', postIds)
                            .gte('date', queryDate)

                        if (dailyErr) console.error('Daily Stats Fetch Error:', dailyErr)

                        if (daily) {
                            daily.forEach((record: any) => {
                                const dayEntry = mergedGraphData.find(d => d.date === record.date)
                                if (dayEntry) {
                                    dayEntry.views += (record.views || 0)
                                    dayEntry.shares += (record.shares || 0)
                                }
                            })
                        }
                    }

                    set({
                        stats: {
                            totalViews,
                            totalShares,
                            graphData: mergedGraphData
                        },
                        statsLastFetched: Date.now(),
                        statsLoading: false
                    })

                } catch (error) {
                    console.error('Failed to fetch stats:', error)
                    set({ statsLoading: false })
                }
            },
            reset: () => set({
                posts: null,
                postsLoading: false,
                postsLastFetched: null,
                settings: null,
                settingsLoading: false,
                settingsLastFetched: null,
                stats: null,
                statsLoading: false,
                statsLastFetched: null
            })
        }),
        {
            name: 'admin-storage',
            partialize: (state) => ({
                posts: state.posts,
                postsLastFetched: state.postsLastFetched,
                settings: state.settings,
                settingsLastFetched: state.settingsLastFetched,
                stats: state.stats,
                statsLastFetched: state.statsLastFetched
            })
        }
    )
)


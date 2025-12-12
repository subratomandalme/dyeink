import { supabase } from '../lib/supabase'
import { Post, CreatePostInput, UpdatePostInput } from '../types'

export const postService = {
    async createPost(post: CreatePostInput): Promise<Post | null> {
        // Generate a slug if not present (simple version)
        const slug = post.title
            .toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '')

        const { data: userData } = await supabase.auth.getUser()
        const userId = userData.user?.id

        if (!userId) {
            throw new Error('User not authenticated. Please log in again.')
        }

        const { data, error } = await supabase
            .from('posts')
            .insert({
                title: post.title,
                content: post.content,
                excerpt: post.excerpt,
                slug: slug, // In a real app, check for uniqueness
                cover_image: post.coverImage,
                published: post.published,
                published_at: post.published ? new Date().toISOString() : null,
                user_id: userId
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating post:', error)
            throw error
        }

        return mapResponseToPost(data)
    },

    async updatePost(id: number, post: UpdatePostInput): Promise<Post | null> {
        const updates: any = {
            ...post,
            updated_at: new Date().toISOString()
        }

        // Handle Publishing Date
        if (post.published === true) {
            updates.published = true
            updates.published_at = new Date().toISOString()
        } else if (post.published === false) {
            updates.published = false
            updates.published_at = null
        }

        // Map camelCase to snake_case for DB
        if (post.coverImage !== undefined) updates.cover_image = post.coverImage
        if (post.published !== undefined) updates.published = post.published

        // Remove mapped keys
        delete updates.coverImage

        const { data, error } = await supabase
            .from('posts')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating post:', error)
            throw error
        }

        return mapResponseToPost(data)
    },

    async getPostById(id: string): Promise<Post | null> {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching post by ID:', error)
            return null
        }

        return mapResponseToPost(data)
    },

    async getPostBySlug(slug: string): Promise<Post | null> {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('slug', slug)
            .single()

        if (error) {
            console.error('Error fetching post:', error)
            return null
        }

        return mapResponseToPost(data)
    },

    async getPosts(): Promise<Post[]> {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching posts:', error)
            return []
        }

        return data.map(mapResponseToPost)
    },
    async deletePost(id: number): Promise<void> {
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', id)

        if (error) throw error
    },

    async deleteAllPosts(): Promise<void> {
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) return

        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('user_id', userData.user.id)

        if (error) {
            console.error('Error deleting all posts:', error)
            throw error
        }
    }
}

// Helper to map DB snake_case to App camelCase
const mapResponseToPost = (data: any): Post => {
    return {
        id: data.id,
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        coverImage: data.cover_image,
        published: data.published,
        publishedAt: data.published_at,
        userId: data.user_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        user: data.user
    }
}

export interface User {
    id: string
    email: string
    name: string
    isAdmin: boolean
    createdAt: string
    updatedAt: string
}

export interface Post {
    id: number
    title: string
    slug: string
    content: string
    excerpt: string
    coverImage: string
    published: boolean
    publishedAt: string | null
    userId: string
    user?: User
    views?: number
    shares?: number
    createdAt: string
    updatedAt: string
}

export interface Domain {
    id: number
    domain: string
    verified: boolean
    verifyToken: string
    userId: string
    createdAt: string
    updatedAt: string
}

export interface PostListResponse {
    posts: Post[]
    total: number
    page: number
    totalPages: number
}

export interface DNSInstructions {
    type: string
    name: string
    value: string
}

export interface CreatePostInput {
    title: string
    content: string
    excerpt: string
    coverImage: string
    published: boolean
}

export interface UpdatePostInput {
    title?: string
    content?: string
    excerpt?: string
    coverImage?: string
    published?: boolean
}

export interface CreateDomainInput {
    domain: string
}

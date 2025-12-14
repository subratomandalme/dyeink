import axios from 'axios'
import { supabase } from '../lib/supabase'
import type {
    Domain,
    DNSInstructions,
    CreateDomainInput
} from '../types'

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
})

// Interceptor to add Supabase auth token
api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await supabase.auth.signOut()
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)


export const domainsApi = {
    list: async (): Promise<{ domains: Domain[] }> => {
        const { data } = await api.get('/admin/domains')
        return data
    },

    create: async (input: CreateDomainInput): Promise<{ domain: Domain; instructions: DNSInstructions }> => {
        const { data } = await api.post('/admin/domains', input)
        return data
    },

    getInstructions: async (id: number): Promise<{ domain: Domain; instructions: DNSInstructions }> => {
        const { data } = await api.get(`/admin/domains/${id}`)
        return data
    },

    verify: async (id: number): Promise<{ domain: Domain }> => {
        const { data } = await api.post(`/admin/domains/${id}/verify`)
        return data
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/admin/domains/${id}`)
    },
}

export default api

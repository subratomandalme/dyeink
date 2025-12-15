import { useEffect } from 'react'

export function useLockBodyScroll() {
    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow
        document.body.style.overflow = 'hidden'
        // Also try to prevent touch move on iOS
        const preventDefault = (e: Event) => e.preventDefault()
        // We might not want to aggressively prevent default on everything, 
        // but overflow: hidden on body is usually enough for modern browsers.
        // For iOS, sometimes we need to lock the root element too.

        return () => {
            document.body.style.overflow = originalStyle
        }
    }, [])
}

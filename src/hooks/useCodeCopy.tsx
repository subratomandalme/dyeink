import { useEffect } from 'react'
export const useCodeCopy = (ref: React.RefObject<HTMLDivElement>) => {
    useEffect(() => {
        if (!ref.current) return
        const preTags = ref.current.querySelectorAll('pre')
        preTags.forEach((pre) => {
            const codeElement = pre.querySelector('code')
            const hasLanguageClass = codeElement && Array.from(codeElement.classList).some(cls => cls.startsWith('language-'))
            if (!hasLanguageClass) {
                return
            }
            if (pre.parentNode && (pre.parentNode as HTMLElement).classList.contains('code-block-wrapper')) {
                return
            }
            const wrapper = document.createElement('div')
            wrapper.className = 'code-block-wrapper'
            wrapper.style.position = 'relative'
            pre.parentNode?.insertBefore(wrapper, pre)
            wrapper.appendChild(pre)
            const button = document.createElement('button')
            button.className = 'copy-code-btn'
            button.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="copy-icon"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            `
            Object.assign(button.style, {
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                padding: '0.25rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                color: '#fff',
                cursor: 'pointer',
                opacity: '0', 
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                zIndex: '10'
            })
            wrapper.addEventListener('mouseenter', () => {
                button.style.opacity = '1'
            })
            wrapper.addEventListener('mouseleave', () => {
                button.style.opacity = '0'
            })
            button.addEventListener('click', async () => {
                const code = pre.textContent || ''
                try {
                    await navigator.clipboard.writeText(code)
                    button.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    `
                    button.style.borderColor = '#22c55e'
                    setTimeout(() => {
                        button.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="copy-icon"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                        `
                        button.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                        button.style.background = 'rgba(255, 255, 255, 0.1)'
                    }, 2000)
                } catch (err) {
                    console.error('Failed to copy!', err)
                }
            })
            wrapper.appendChild(button)
        })
    }, [ref])
}
 

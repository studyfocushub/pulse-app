'use client'
import { useEffect, useRef } from 'react'

export default function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const trailRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let mx = 0, my = 0, tx = 0, ty = 0

    const move = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY
      if (cursorRef.current) {
        cursorRef.current.style.left = mx - 5 + 'px'
        cursorRef.current.style.top = my - 5 + 'px'
      }
    }

    const animate = () => {
      tx += (mx - tx) * 0.14
      ty += (my - ty) * 0.14
      if (trailRef.current) {
        trailRef.current.style.left = tx - 13 + 'px'
        trailRef.current.style.top = ty - 13 + 'px'
      }
      requestAnimationFrame(animate)
    }

    document.addEventListener('mousemove', move)
    animate()

    const hoverEls = document.querySelectorAll('button, a, input, textarea, select, [data-hover]')
    hoverEls.forEach(el => {
      el.addEventListener('mouseenter', () => {
        if (cursorRef.current) { cursorRef.current.style.transform = 'scale(2.2)'; cursorRef.current.style.background = '#be9470' }
      })
      el.addEventListener('mouseleave', () => {
        if (cursorRef.current) { cursorRef.current.style.transform = 'scale(1)'; cursorRef.current.style.background = '#c4728a' }
      })
    })

    return () => document.removeEventListener('mousemove', move)
  }, [])

  return (
    <>
      <div ref={cursorRef} style={{
        width: 10, height: 10, background: '#c4728a', borderRadius: '50%',
        position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 9999,
        transition: 'transform 0.12s ease, background 0.2s', mixBlendMode: 'multiply'
      }} />
      <div ref={trailRef} style={{
        width: 26, height: 26, border: '1.5px solid rgba(196,114,138,0.35)',
        borderRadius: '50%', position: 'fixed', top: 0, left: 0,
        pointerEvents: 'none', zIndex: 9998, transition: 'all 0.28s ease'
      }} />
    </>
  )
}

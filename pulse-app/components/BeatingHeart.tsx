'use client'

interface HeartProps {
  size?: number
  streak?: number
  onClick?: () => void
}

export default function BeatingHeart({ size = 200, streak = 0, onClick }: HeartProps) {
  return (
    <div style={{ position: 'relative', width: size, height: size }} onClick={onClick}>
      {/* Pulse ring */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        width: '100%', height: '100%',
        transform: 'translate(-50%, -50%)',
        animation: 'pulseRing 1.8s ease-out infinite',
        borderRadius: '50%', pointerEvents: 'none'
      }} />

      {/* Heart SVG */}
      <svg
        style={{
          width: '100%', height: '100%',
          filter: 'drop-shadow(0 6px 28px rgba(196,114,138,0.4)) drop-shadow(0 2px 8px rgba(196,114,138,0.22))',
          animation: 'heartbeat 1.8s ease-in-out infinite',
          cursor: 'pointer'
        }}
        viewBox="0 0 200 180"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="hg" cx="50%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#fad4de"/>
            <stop offset="45%" stopColor="#e8a0b4"/>
            <stop offset="100%" stopColor="#c4728a"/>
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="cb"/>
            <feMerge><feMergeNode in="cb"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <clipPath id="hclip">
            <path d="M100 162 C100 162 14 106 14 54 C14 29 34 14 60 14 C75 14 88 21 100 34 C112 21 125 14 140 14 C166 14 186 29 186 54 C186 106 100 162 100 162Z"/>
          </clipPath>
          <linearGradient id="liqG" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(250,212,222,0.5)"/>
            <stop offset="100%" stopColor="rgba(196,114,138,0.85)"/>
          </linearGradient>
        </defs>

        {/* Heart shape */}
        <path d="M100 162 C100 162 14 106 14 54 C14 29 34 14 60 14 C75 14 88 21 100 34 C112 21 125 14 140 14 C166 14 186 29 186 54 C186 106 100 162 100 162Z" fill="url(#hg)" filter="url(#glow)"/>

        {/* Liquid waves */}
        <g clipPath="url(#hclip)">
          <rect x="0" y="0" width="200" height="200" fill="url(#liqG)" opacity="0.22"/>
          <path d="M-20,96 Q20,76 60,96 Q100,116 140,96 Q180,76 220,96 L220,200 L-20,200Z" fill="rgba(232,160,176,0.42)">
            <animateTransform attributeName="transform" type="translate" values="-80,0;80,0;-80,0" dur="3.8s" repeatCount="indefinite"/>
          </path>
          <path d="M-20,108 Q20,88 60,108 Q100,128 140,108 Q180,88 220,108 L220,200 L-20,200Z" fill="rgba(196,114,138,0.28)">
            <animateTransform attributeName="transform" type="translate" values="80,0;-80,0;80,0" dur="5s" repeatCount="indefinite"/>
          </path>
        </g>

        {/* Streak number */}
        {streak > 0 && (
          <text x="100" y="108" textAnchor="middle" fill="white" fontSize="28" fontFamily="Playfair Display, serif" fontWeight="600" opacity="0.9">
            {streak}
          </text>
        )}

        {/* Shimmer */}
        <path d="M72 36 Q80 27 90 34" stroke="rgba(255,255,255,0.62)" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      </svg>

      {/* ECG line */}
      {streak > 0 && (
        <div style={{ position: 'absolute', bottom: -28, left: '50%', transform: 'translateX(-50%)', width: 260 }}>
          <svg viewBox="0 0 260 38" fill="none" width="260">
            <path d="M0,19 L36,19 L46,19 L54,4 L61,34 L68,9 L74,19 L110,19 L120,19 L128,4 L135,34 L142,9 L148,19 L184,19 L194,19 L202,4 L209,34 L216,9 L222,19 L260,19"
              stroke="#e0a0b4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </div>
  )
}

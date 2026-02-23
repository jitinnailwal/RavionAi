import React from 'react'

const RavionLogo = ({ size = 160, className = '' }) => {
  return (
    <div className={`logo-spin ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="orbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA"/>
            <stop offset="50%" stopColor="#3B82F6"/>
            <stop offset="100%" stopColor="#1D4ED8"/>
          </linearGradient>
        </defs>

        {/* Orbital ring 1 */}
        <ellipse cx="80" cy="80" rx="70" ry="28" transform="rotate(-35 80 80)"
          stroke="url(#orbGrad)" strokeWidth="3" fill="none" opacity="0.85"/>

        {/* Orbital ring 2 */}
        <ellipse cx="80" cy="80" rx="70" ry="28" transform="rotate(35 80 80)"
          stroke="url(#orbGrad)" strokeWidth="3" fill="none" opacity="0.85"/>

        {/* Circuit nodes on orbital 1 */}
        <circle cx="38" cy="42" r="4.5" fill="#60A5FA"/>
        <circle cx="122" cy="118" r="4.5" fill="#3B82F6"/>
        <circle cx="56" cy="34" r="3" fill="#93C5FD"/>
        <circle cx="104" cy="126" r="3" fill="#93C5FD"/>

        {/* Circuit nodes on orbital 2 */}
        <circle cx="122" cy="42" r="4.5" fill="#60A5FA"/>
        <circle cx="38" cy="118" r="4.5" fill="#3B82F6"/>
        <circle cx="108" cy="36" r="3" fill="#93C5FD"/>
        <circle cx="52" cy="124" r="3" fill="#93C5FD"/>

        {/* Extra circuit dots */}
        <circle cx="80" cy="52" r="2.5" fill="#60A5FA" opacity="0.7"/>
        <circle cx="80" cy="108" r="2.5" fill="#3B82F6" opacity="0.7"/>
        <circle cx="28" cy="80" r="2.5" fill="#93C5FD" opacity="0.5"/>
        <circle cx="132" cy="80" r="2.5" fill="#93C5FD" opacity="0.5"/>

        {/* Center core */}
        <circle cx="80" cy="80" r="14" fill="#0F172A" stroke="url(#orbGrad)" strokeWidth="2.5"/>
        <circle cx="80" cy="80" r="8" fill="url(#orbGrad)" opacity="0.9"/>
        <circle cx="80" cy="80" r="4" fill="#60A5FA"/>

        {/* Circuit trace lines */}
        <line x1="80" y1="66" x2="80" y2="52" stroke="#60A5FA" strokeWidth="1" opacity="0.4"/>
        <line x1="80" y1="94" x2="80" y2="108" stroke="#3B82F6" strokeWidth="1" opacity="0.4"/>
        <line x1="66" y1="80" x2="52" y2="72" stroke="#60A5FA" strokeWidth="1" opacity="0.3"/>
        <line x1="94" y1="80" x2="108" y2="88" stroke="#3B82F6" strokeWidth="1" opacity="0.3"/>
      </svg>
    </div>
  )
}

export default RavionLogo

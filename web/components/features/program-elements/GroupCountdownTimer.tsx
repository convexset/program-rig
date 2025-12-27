'use client';

import { formatTime } from '@/lib/utils/time';

interface GroupCountdownTimerProps {
  timeLeft: number; // seconds remaining in group
  style?: 'normal' | 'rest';
}

export default function GroupCountdownTimer({ timeLeft, style = 'normal' }: GroupCountdownTimerProps) {
  const bgColor = style === 'rest' ? '#e3f2fd' : '#fff3e0';
  const textColor = style === 'rest' ? '#0d47a1' : '#e65100';
  const borderColor = style === 'rest' ? '#1976d2' : '#ff9800';

  return (
    <div
      style={{
        textAlign: 'center',
        fontSize: '5rem',
        fontFamily: 'monospace',
        fontWeight: '700',
        padding: '3rem 2rem',
        backgroundColor: bgColor,
        color: textColor,
        border: `4px solid ${borderColor}`,
        borderRadius: '12px',
        marginBottom: '0.5rem',
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
        letterSpacing: '0.1em',
      }}
    >
      {formatTime(Math.max(0, Math.ceil(timeLeft)))}
    </div>
  );
}

'use client';

interface OverallProgressBarProps {
  progress: number; // 0 to 1
  style?: 'normal' | 'rest';
}

export default function OverallProgressBar({ progress, style = 'normal' }: OverallProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(1, progress)) * 100;
  const barColor = style === 'rest' ? '#1976d2' : '#4caf50';
  const barGradient = style === 'rest' 
    ? 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)'
    : 'linear-gradient(90deg, #4caf50 0%, #81c784 100%)';

  return (
    <div
      style={{
        width: '100%',
        height: '8px',
        backgroundColor: '#e0e0e0',
        borderRadius: '4px',
        overflow: 'hidden',
        margin: '0.5rem 0 1rem 0',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <div
        style={{
          width: `${clampedProgress}%`,
          height: '100%',
          background: barGradient,
          transition: 'width 0.1s linear',
          boxShadow: '0 0 8px rgba(76, 175, 80, 0.5)',
        }}
      />
    </div>
  );
}

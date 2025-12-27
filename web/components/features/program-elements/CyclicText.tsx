'use client';

import { CyclicTextItem } from '@/types/program';

interface CyclicTextProps {
  items: CyclicTextItem[];
  timeElapsedInGroup: number; // seconds since group started
  style?: 'normal' | 'rest';
}

export default function CyclicText({ items, timeElapsedInGroup, style = 'normal' }: CyclicTextProps) {
  // Calculate total cycle duration
  const totalCycleDuration = items.reduce((sum, item) => sum + item.duration, 0);
  
  if (totalCycleDuration === 0) {
    return <div>Error: Cyclic text has zero duration</div>;
  }

  // Find current item
  const timeInCycle = timeElapsedInGroup % totalCycleDuration;
  let accumulatedTime = 0;
  let currentItem: CyclicTextItem | null = null;
  let timeLeftInItem = 0;

  for (const item of items) {
    if (timeInCycle >= accumulatedTime && timeInCycle < accumulatedTime + item.duration) {
      currentItem = item;
      timeLeftInItem = item.duration - (timeInCycle - accumulatedTime);
      break;
    }
    accumulatedTime += item.duration;
  }

  if (!currentItem) {
    // Fallback to first item
    currentItem = items[0];
    timeLeftInItem = items[0].duration;
  }

  const bgColor = style === 'rest' ? '#e3f2fd' : '#f5f5f5';
  const textColor = style === 'rest' ? '#1976d2' : '#212121';
  const borderColor = style === 'rest' ? '#90caf9' : '#bdbdbd';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '2rem',
        padding: '1.5rem 2rem',
        backgroundColor: bgColor,
        color: textColor,
        fontWeight: 'bold',
        borderLeft: `6px solid ${borderColor}`,
        marginBottom: '0.5rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <span style={{ 
        minWidth: '80px', 
        fontFamily: 'monospace', 
        fontSize: '1.8rem',
        color: style === 'rest' ? '#0d47a1' : '#e65100',
        fontWeight: '700'
      }}>{Math.ceil(timeLeftInItem)}s</span>
      <span style={{ 
        flex: 1, 
        textAlign: 'center',
        fontSize: '2.2rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>{currentItem['center-text']}</span>
      <span style={{ 
        minWidth: '120px', 
        textAlign: 'right',
        fontSize: '1.8rem',
        opacity: 0.9
      }}>{currentItem['right-text']}</span>
    </div>
  );
}

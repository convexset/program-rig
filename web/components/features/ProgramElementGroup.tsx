'use client';

import { Group } from '@/types/program';
import CyclicText from './program-elements/CyclicText';
import YouTubeEmbed from './program-elements/YouTubeEmbed';
import GroupCountdownTimer from './program-elements/GroupCountdownTimer';
import CenteredText from './program-elements/CenteredText';

interface ProgramElementGroupProps {
  workoutStartTime: Date;
  groupStartTime: Date;
  currentTime: Date;
  totalScreenDuration: number; // seconds
  groupDescription: Group;
}

export default function ProgramElementGroup({
  workoutStartTime,
  groupStartTime,
  currentTime,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  totalScreenDuration,
  groupDescription,
}: ProgramElementGroupProps) {
  // Calculate time elapsed
  const timeElapsedInGroup = (currentTime.getTime() - groupStartTime.getTime()) / 1000;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const timeElapsedInWorkout = (currentTime.getTime() - workoutStartTime.getTime()) / 1000;
  const timeLeftInGroup = groupDescription.duration - timeElapsedInGroup;

  const style = groupDescription.style;

  // Container styling based on group style
  const containerStyle: React.CSSProperties = {
    minHeight: '97vh',
    backgroundColor: style === 'rest' ? '#f5f5f5' : '#ffffff',
    padding: '2rem',
  };

  return (
    <div style={containerStyle}>
      {groupDescription.parts.map((part, index) => {
        if (part.type === 'cyclic-text') {
          return (
            <CyclicText
              key={index}
              items={part.items}
              timeElapsedInGroup={timeElapsedInGroup}
              style={style}
            />
          );
        } else if (part.type === 'youtube') {
          return <YouTubeEmbed key={index} videoId={part.id} style={style} />;
        } else if (part.type === 'centered-text') {
          return <CenteredText key={index} label={part.label} style={style} isShort={false} />;
        } else if (part.type === 'centered-short-text') {
          return <CenteredText key={index} label={part.label} style={style} isShort={true} />;
        } else if (part.type === 'group-countdown-timer') {
          return <GroupCountdownTimer key={index} timeLeft={timeLeftInGroup} style={style} />;
        }
        return null;
      })}
    </div>
  );
}

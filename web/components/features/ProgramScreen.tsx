'use client';

import { ProgramDefinition, GroupTiming } from '@/types/program';
import { appConfig } from '@/config/app-config';
import VerticalContainer from '@/components/layout/VerticalContainer';
import ProgramElementGroup from './ProgramElementGroup';
import OverallProgressBar from './program-elements/OverallProgressBar';
import { useEffect, useRef, useMemo } from 'react';

interface ProgramScreenProps {
  programDefinition: ProgramDefinition;
  selectedScreen: number; // index into programDefinition.screens
  workoutStartTime: Date;
  currentTime: Date;
  timingTickers?: {
    tick: () => void;
    beep: () => void;
  };
}

export default function ProgramScreen({
  programDefinition,
  selectedScreen,
  workoutStartTime,
  currentTime,
  timingTickers = { tick: () => {}, beep: () => {} },
}: ProgramScreenProps) {
  // Track previous state for sound triggers
  const prevSecondsUntilStartRef = useRef<number | null>(null);
  const prevSecondsElapsedRef = useRef<number | null>(null);
  const hasPlayedEndBeepRef = useRef(false);

  // Validate screen index
  const isValidScreen = selectedScreen >= 0 && selectedScreen < programDefinition.screens.length;
  const screen = isValidScreen ? programDefinition.screens[selectedScreen] : null;

  // Calculate group timings and beep times
  const { groupTimings, totalScreenDuration, beepTimes } = useMemo(() => {
    const timings: GroupTiming[] = [];
    const beeps = new Set<number>();
    let cumulativeTime = 0;

    if (screen) {
      // Workout start beep
      beeps.add(0);

      for (const group of screen.groups) {
        // Group start beep
        beeps.add(cumulativeTime);

        timings.push({
          group,
          startTime: new Date(workoutStartTime.getTime() + cumulativeTime * 1000),
          endTime: new Date(workoutStartTime.getTime() + (cumulativeTime + group.duration) * 1000),
        });

        // Calculate cyclic text transition beeps within this group
        const cyclicTextParts = group.parts.filter(part => part.type === 'cyclic-text');
        if (cyclicTextParts.length > 0) {
          for (const cyclicPart of cyclicTextParts) {
            let cyclicTime = 0;
            for (const item of cyclicPart.items) {
              // Add beep at the start of each cyclic text item (except the very first one in the group)
              const absoluteTime = cumulativeTime + cyclicTime;
              if (cyclicTime > 0) {
                beeps.add(absoluteTime);
              }
              cyclicTime += item.duration;
            }
          }
        }

        cumulativeTime += group.duration;
      }

      // Workout end beep
      beeps.add(cumulativeTime);
    }

    return { 
      groupTimings: timings, 
      totalScreenDuration: cumulativeTime,
      beepTimes: beeps
    };
  }, [screen, workoutStartTime]);

  // Find current group
  const currentGroup = groupTimings.find(
    (gt) => gt.startTime <= currentTime && currentTime < gt.endTime
  );

  // Play sounds based on state changes
  useEffect(() => {
    // Skip if invalid screen
    if (!isValidScreen) return;

    // Before workout starts - tick each second
    if (currentTime < workoutStartTime) {
      const secondsUntilStart = Math.ceil((workoutStartTime.getTime() - currentTime.getTime()) / 1000);
      
      // Reset end beep flag when waiting
      hasPlayedEndBeepRef.current = false;
      
      // Play tick if second changed
      if (prevSecondsUntilStartRef.current !== null && prevSecondsUntilStartRef.current !== secondsUntilStart) {
        timingTickers.tick();
      }
      prevSecondsUntilStartRef.current = secondsUntilStart;
      prevSecondsElapsedRef.current = null;
    }
    // Workout in progress
    else if (currentGroup) {
      const secondsElapsed = Math.floor((currentTime.getTime() - workoutStartTime.getTime()) / 1000);
      
      // Check if this second should have a beep
      const shouldBeep = beepTimes.has(secondsElapsed);
      
      // Play beep or tick for each second
      const isNewSecond = prevSecondsElapsedRef.current !== null && prevSecondsElapsedRef.current !== secondsElapsed;
      if (isNewSecond) {
        if (shouldBeep) {
          timingTickers.beep();
        } else {
          timingTickers.tick();
        }
      }
      
      prevSecondsUntilStartRef.current = null;
      prevSecondsElapsedRef.current = secondsElapsed;
    }
    // Workout ended
    else if (currentTime >= new Date(workoutStartTime.getTime() + totalScreenDuration * 1000)) {
      // Play beep when workout completes
      if (!hasPlayedEndBeepRef.current) {
        timingTickers.beep();
        hasPlayedEndBeepRef.current = true;
      }
      prevSecondsUntilStartRef.current = null;
      prevSecondsElapsedRef.current = null;
    }
  }, [isValidScreen, currentTime, workoutStartTime, currentGroup, totalScreenDuration, beepTimes, timingTickers]);

  // Return early for invalid screen after all hooks are called
  if (!isValidScreen) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Invalid screen selection</div>;
  }

  // Before workout starts
  if (currentTime < workoutStartTime) {
    const secondsUntilStart = Math.ceil((workoutStartTime.getTime() - currentTime.getTime()) / 1000);
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: appConfig.settings.maxWidth, width: '100%' }}>
          <VerticalContainer>
            <div
              style={{
                minHeight: '97vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
              }}
            >
              <h1 style={{ fontSize: '3rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '2rem' }}>
                {screen?.name}
              </h1>
              <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Workout starts in</h2>
              <div style={{ fontSize: '5rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
                {Math.floor(secondsUntilStart / 60) > 0 ? `${Math.floor(secondsUntilStart / 60)}min` : ''} {secondsUntilStart % 60 > 0 ? `${secondsUntilStart % 60}sec` : ''}
              </div>
            </div>
          </VerticalContainer>
        </div>
      </div>
    );
  }

  // Display current group
  if (currentGroup) {
    const timeElapsedInWorkout = (currentTime.getTime() - workoutStartTime.getTime()) / 1000;
    const style = currentGroup.group.style;
    
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: appConfig.settings.maxWidth, width: '100%' }}>
          <VerticalContainer>
            <OverallProgressBar
              progress={timeElapsedInWorkout / totalScreenDuration}
              style={style}
            />
            {/* <h1 style={{ fontSize: '3rem', fontWeight: 'bold', textAlign: 'center', margin: '2rem' }}>
              {screen.name}
            </h1> */}
            <ProgramElementGroup
              workoutStartTime={workoutStartTime}
              groupStartTime={currentGroup.startTime}
              currentTime={currentTime}
              totalScreenDuration={totalScreenDuration}
              groupDescription={currentGroup.group}
            />
          </VerticalContainer>
        </div>
      </div>
    );
  }

  // After workout ends - show closing message
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: appConfig.settings.maxWidth, width: '100%' }}>
        <VerticalContainer>
          <div
            style={{
              minHeight: '97vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
            }}
          >
            <h1 style={{ fontSize: '3rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '2rem' }}>
              {screen?.name}
            </h1>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Workout Complete!</h2>
            {screen?.closingMessage && (
              <div
                className="closing-message-content"
                style={{ 
                  fontSize: '1.1rem', 
                  lineHeight: '1.8', 
                  maxWidth: '700px',
                  width: '100%'
                }}
                dangerouslySetInnerHTML={{ __html: screen.closingMessage }}
              />
            )}
          </div>
        </VerticalContainer>
      </div>
    </div>
  );
}

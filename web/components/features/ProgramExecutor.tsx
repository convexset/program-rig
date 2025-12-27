'use client';

import { useState, useEffect, useRef } from 'react';
import { ProgramDefinition, ProgramState } from '@/types/program';
import { roundToNearestSecond } from '@/lib/utils/time';
import { playTickTone, playBeepTone } from '@/lib/utils/sounds';
import ProgramParser from './ProgramParser';
import ProgramScreen from './ProgramScreen';

import { appConfig } from '@/config/app-config';

const LOCALSTORAGE_STATE_KEY = 'programState';

export default function ProgramExecutor() {
  const [isLive, setIsLive] = useState(false);
  const [programState, setProgramState] = useState<ProgramState | null>(null);
  const [programDefinition, setProgramDefinition] = useState<ProgramDefinition | null>(null);
  const [selectedScreen, setSelectedScreen] = useState(0);
  const [stateSource, setStateSource] = useState<'localStorage' | 'api'>('localStorage');
  const [stateSourceUrl, setStateSourceUrl] = useState(`${appConfig.apiRoot}/workout-state/your-workout-code`);
  const [enableStateSetter, setEnableStateSetter] = useState(false);
  const [stateSetterUrl, setStateSetterUrl] = useState(`${appConfig.apiRoot}/workout-state/your-workout-code/your-api-key`);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [startDateTimeInput, setStartDateTimeInput] = useState('');
  
  // Track last poll time to enforce poll interval
  const lastPollTimeRef = useRef<number>(0);

  // Update current time every 10ms when live
  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        setTimeout(() => setCurrentTime(roundToNearestSecond(new Date())), 0);
      }, 10);
      return () => clearInterval(interval);
    }
  }, [isLive]);

  // Polling for state
  useEffect(() => {
    if (!isLive) return;

    // Poll every 1s for localStorage, 5s/15s for API
    const pollInterval = stateSource === 'localStorage' 
      ? 1000 
      : (programState === null ? 5000 : 15000);
    
    const poll = () => {
      const now = Date.now();
      
      // Enforce minimum time between polls
      if (now - lastPollTimeRef.current < pollInterval) {
        return;
      }
      
      lastPollTimeRef.current = now;
      
      if (stateSource === 'localStorage') {
        const stored = localStorage.getItem(LOCALSTORAGE_STATE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setTimeout(() => setProgramState(parsed), 0);
          } catch (e) {
            console.error('Error parsing program state:', e);
          }
        }
      } else if (stateSource === 'api' && stateSourceUrl) {
        fetch(stateSourceUrl)
          .then((res) => res.json())
          .then((data) => {
            if (data.Code && data.Message) {
              throw data;
            } else {
                setProgramState(data)
            }
          })
          .catch((err) => {
            setProgramState(null);
            if (err.Code !== 'NotFoundError') {
              console.error('Error fetching program state:', err)
            }
          });
      }
    };

    // Initial poll
    poll();

    // Set up interval
    const interval = setInterval(poll, pollInterval);
    
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive, stateSource, stateSourceUrl, programDefinition]);

  const handleProceed = () => {
    if (!programDefinition) return;

    // If state setter is enabled, prompt to clear state
    if (enableStateSetter) {
      const shouldClear = window.confirm(
        'Do you want to clear the existing workout state before proceeding?'
      );
      if (shouldClear) {
        if (stateSource === 'localStorage') {
          localStorage.removeItem(LOCALSTORAGE_STATE_KEY);
        } else if (stateSource === 'api' && stateSetterUrl) {
          fetch(stateSetterUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(null),
          }).catch((err) => console.error('Error clearing state:', err));
        }
        setProgramState(null);
      }
    }

    setIsLive(true);
  };

  const handleSetStartTime = () => {
    if (!startDateTimeInput) return;

    const startTime = new Date(startDateTimeInput);
    const now = new Date();
    const diff = (startTime.getTime() - now.getTime()) / 1000;

    if (diff < 60) {
      alert('Start time must be at least 1 minute in the future');
      return;
    }

    const newState: ProgramState = {
      startDateTime: startTime.toISOString(),
    };

    if (stateSource === 'localStorage') {
      localStorage.setItem(LOCALSTORAGE_STATE_KEY, JSON.stringify(newState));
    } else if (stateSource === 'api' && stateSetterUrl) {
      fetch(stateSetterUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newState),
      }).catch((err) => console.error('Error setting state:', err));
    }

    setProgramState(newState);
    setStartDateTimeInput('');
  };

  const handleStartASAP = () => {
    const now = new Date();
    const startTime = new Date(Math.ceil(now.getTime() / 1000) * 1000 + 15000);

    const newState: ProgramState = {
      startDateTime: startTime.toISOString(),
    };

    if (stateSource === 'localStorage') {
      localStorage.setItem(LOCALSTORAGE_STATE_KEY, JSON.stringify(newState));
    } else if (stateSource === 'api' && stateSetterUrl) {
      fetch(stateSetterUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newState),
      }).catch((err) => console.error('Error setting state:', err));
    }

    setProgramState(newState);
  };

  const handleRestartWorkout = () => {
    const now = new Date();
    const startTime = new Date(Math.ceil(now.getTime() / 1000) * 1000 + 10000);

    const newState: ProgramState = {
      startDateTime: startTime.toISOString(),
    };

    if (stateSource === 'localStorage') {
      localStorage.setItem(LOCALSTORAGE_STATE_KEY, JSON.stringify(newState));
    } else if (stateSource === 'api' && stateSetterUrl) {
      fetch(stateSetterUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newState),
      }).catch((err) => console.error('Error setting state:', err));
    }

    setProgramState(newState);
  };

  const handleRewind = ({ goBack = true, dtInMs = 10000 } = {}) => {
    if (!programState) return;

    const currentStartTime = new Date(programState.startDateTime);
    const newStartTime = new Date(currentStartTime.getTime() + (goBack ? dtInMs : -dtInMs)); // Add or subtract 10 seconds
    const newState: ProgramState = {
      startDateTime: newStartTime.toISOString(),
    };

    if (stateSource === 'localStorage') {
      localStorage.setItem(LOCALSTORAGE_STATE_KEY, JSON.stringify(newState));
    } else if (stateSource === 'api' && stateSetterUrl) {
      fetch(stateSetterUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newState),
      }).catch((err) => console.error('Error setting state:', err));
    }

    setProgramState(newState);
  };

  // Setup mode UI
  if (!isLive) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Setup</h1>

        {/* Program Parser */}
        <ProgramParser setProgramDefinition={setProgramDefinition} />

        {/* Configuration */}
        {programDefinition && (
          <div style={{ marginTop: '2rem', border: '1px solid #ccc', borderRadius: '4px', padding: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Configuration</h2>

            {/* Screen Selector */}
            {programDefinition.screens.length > 1 && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ marginRight: '0.5rem', fontWeight: 'bold' }}>Select Screen:</label>
                <select
                  value={selectedScreen}
                  onChange={(e) => setSelectedScreen(parseInt(e.target.value))}
                  style={{ padding: '0.5rem', fontSize: '1rem' }}
                >
                  {programDefinition.screens.map((screen, index) => (
                    <option key={index} value={index}>
                      {screen.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* State Source Selector */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                State Source:
              </label>
              <div>
                <label style={{ marginRight: '1rem' }}>
                  <input
                    type="radio"
                    value="localStorage"
                    checked={stateSource === 'localStorage'}
                    onChange={(e) => setStateSource(e.target.value as 'localStorage')}
                  />
                  {' '}LocalStorage
                </label>
                <label>
                  <input
                    type="radio"
                    value="api"
                    checked={stateSource === 'api'}
                    onChange={(e) => setStateSource(e.target.value as 'api')}
                  />
                  {' '}API
                </label>
              </div>
              {stateSource === 'api' && (
                <input
                  type="text"
                  value={stateSourceUrl}
                  onChange={(e) => setStateSourceUrl(e.target.value)}
                  placeholder="GET URL for state"
                  style={{ marginTop: '0.5rem', width: '100%', padding: '0.5rem' }}
                />
              )}
            </div>

            {/* State Setter */}
            <div style={{ marginBottom: '1rem' }}>
              <label>
                <input
                  type="checkbox"
                  checked={enableStateSetter}
                  onChange={(e) => setEnableStateSetter(e.target.checked)}
                />
                {' '}Enable State Setter
              </label>
              {enableStateSetter && stateSource === 'api' && (
                <input
                  type="text"
                  value={stateSetterUrl}
                  onChange={(e) => setStateSetterUrl(e.target.value)}
                  placeholder="POST URL for setting state"
                  style={{ marginTop: '0.5rem', width: '100%', padding: '0.5rem' }}
                />
              )}
            </div>

            <div>When in doubt, use the LocalStorage State Source, and enable the State Setter. This will allow you to display a multi-screen program in multiple browser windows/tabs on the same machine.</div>

            {/* Proceed Button */}
            <button
              onClick={handleProceed}
              style={{
                padding: '0.75rem 2rem',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                backgroundColor: '#2196f3',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Proceed
            </button>
          </div>
        )}
      </div>
    );
  }

  // Live mode - waiting for start
  if (!programState && isLive) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Waiting for Workout to Start...</h1>
        <p>Polling for state every 5 seconds</p>

        {enableStateSetter && (
          <div style={{ marginTop: '2rem', maxWidth: '500px', margin: '2rem auto' }}>
            <h2>Quick Actions</h2>
            <button
              onClick={handleStartASAP}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                backgroundColor: '#ff9800',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginBottom: '2rem',
              }}
            >
              Start ASAP (15s)
            </button>
            <h2>Set Start Time</h2>
            <input
              type="datetime-local"
              value={startDateTimeInput}
              onChange={(e) => setStartDateTimeInput(e.target.value)}
              style={{ padding: '0.5rem', fontSize: '1rem', marginRight: '0.5rem' }}
            />
            <button
              onClick={handleSetStartTime}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '1rem',
                backgroundColor: '#4caf50',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Set Start Time
            </button>
          </div>
        )}

        <button
          onClick={() => setIsLive(false)}
          style={{
            marginTop: '2rem',
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            backgroundColor: '#f44336',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Back to Setup
        </button>
      </div>
    );
  }

  // Live mode - running
  if (programState && programDefinition) {
    const workoutStartTime = new Date(programState.startDateTime);
    const workoutEndTime = new Date(workoutStartTime.getTime() + programDefinition.screenDuration * 1000);
    const isWorkoutConcluded = currentTime >= workoutEndTime;

    return (
      <div>
        {/* Controls Bar */}
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#f5f5f5', 
          borderBottom: '1px solid #ccc',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {enableStateSetter && (
            <button
              onClick={handleRestartWorkout}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '1rem',
                backgroundColor: '#ff9800',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Restart Workout
            </button>
          )}
          {enableStateSetter && !isWorkoutConcluded && (
            <>
              <button
              onClick={() => handleRewind({ goBack: true, dtInMs: 10000 })}
              style={{
                  padding: '0.5rem 1rem',
                  fontSize: '1rem',
                  backgroundColor: '#9c27b0',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
              }}
              >
              Rewind (10s)
              </button>
              <button
              onClick={() => handleRewind({ goBack: false, dtInMs: 10000 })}
              style={{
                  padding: '0.5rem 1rem',
                  fontSize: '1rem',
                  backgroundColor: '#9c27b0',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
              }}
              >
              FF (10s)
              </button>
            </>
          )}
          <button
            onClick={() => setIsLive(false)}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              backgroundColor: '#757575',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Back to Setup
          </button>
          {programDefinition.screens.length > 1 && (
            <div>
              <label style={{ marginRight: '0.5rem' }}>Screen:</label>
              <select
                value={selectedScreen}
                onChange={(e) => setSelectedScreen(parseInt(e.target.value))}
                style={{ padding: '0.5rem', fontSize: '1rem' }}
              >
                {programDefinition.screens.map((screen, index) => (
                  <option key={index} value={index}>
                    {screen.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        {/* Program Display */}
        <ProgramScreen
          programDefinition={programDefinition}
          selectedScreen={selectedScreen}
          workoutStartTime={workoutStartTime}
          currentTime={currentTime}
          timingTickers={{
            tick: playTickTone,
            beep: playBeepTone,
          }}
        />
      </div>
    );
  }

  return <div>Loading...</div>;
}

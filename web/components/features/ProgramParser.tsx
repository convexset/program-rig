'use client';

import { useState, useEffect } from 'react';
import { ProgramDefinition } from '@/types/program';
import { parseProgram } from '@/lib/parsers/program-parser';
import { validateProgram } from '@/lib/validators/program-validator';
import ProgramScreen from './ProgramScreen';
import sampleWorkouts from '@/lib/sample-workouts';

interface ProgramParserProps {
  setProgramDefinition: (definition: ProgramDefinition | null) => void;
}

const LOCALSTORAGE_KEY = 'lastValidProgram';

export default function ProgramParser({ setProgramDefinition }: ProgramParserProps) {
  const [inputText, setInputText] = useState('');
  const [parsedProgram, setParsedProgram] = useState<ProgramDefinition | null>(null);
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; errors: string[]; warnings: string[] } | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedPreviewScreen, setSelectedPreviewScreen] = useState(0);
  const [previewTimeOffset, setPreviewTimeOffset] = useState(0); // seconds
  const [workoutStartTime] = useState(() => new Date()); // Fixed time for preview

  // Auto-advance preview every 0.25 seconds
  useEffect(() => {
    if (parsedProgram && parsedProgram.screenDuration > 0) {
      const interval = setInterval(() => {
        setPreviewTimeOffset((prev) => {
          const next = prev + 1;
          return next >= parsedProgram.screenDuration + 10 ? 0 : next;
        });
      }, 250);
      return () => clearInterval(interval);
    }
  }, [parsedProgram]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCALSTORAGE_KEY);
    if (saved) {
      setTimeout(() => setInputText(saved), 0);
    }
  }, []);

  // Parse and validate whenever input changes
  useEffect(() => {
    if (inputText.trim()) {
      const parsed = parseProgram(inputText);
      setTimeout(() => setParsedProgram(parsed), 0);

      const validation = validateProgram(parsed);
      setTimeout(() => setValidationResult(validation), 0);

      // Save valid programs to localStorage
      if (validation.isValid && parsed) {
        localStorage.setItem(LOCALSTORAGE_KEY, inputText);
      }
    } else {
      setTimeout(() => {
          setParsedProgram(null);
          setValidationResult(null);
      }, 0);
    }
  }, [inputText]);

  const handleConfirm = () => {
    if (validationResult?.isValid && parsedProgram) {
      setProgramDefinition(parsedProgram);
      setIsCollapsed(true);
    }
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Generate preview times
  const currentTime = new Date(workoutStartTime.getTime() + previewTimeOffset * 1000);

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '4px', margin: '1rem 0' }}>
      {/* Header */}
      <div
        onClick={handleToggleCollapse}
        style={{
          padding: '1rem',
          backgroundColor: '#f5f5f5',
          cursor: 'pointer',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>Program Parser</span>
        <span>{isCollapsed ? '▼' : '▲'}</span>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div style={{ padding: '1rem' }}>
          {/* Input Area */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
              Program Description:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{
                width: '100%',
                minHeight: '300px',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
              placeholder="Enter program description..."
            />
          </div>

          {/* Validation Messages */}
          {validationResult && (
            <div style={{ marginBottom: '1rem' }}>
              {validationResult.errors.length > 0 && (
                <div
                  style={{
                    padding: '0.5rem',
                    backgroundColor: '#ffebee',
                    border: '1px solid #ef5350',
                    borderRadius: '4px',
                    marginBottom: '0.5rem',
                  }}
                >
                  <strong>Errors:</strong>
                  <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                    {validationResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              {validationResult.warnings.length > 0 && (
                <div
                  style={{
                    padding: '0.5rem',
                    backgroundColor: '#fff3e0',
                    border: '1px solid #ff9800',
                    borderRadius: '4px',
                  }}
                >
                  <strong>Warnings:</strong>
                  <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                    {validationResult.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
              {validationResult.isValid && (
                <div
                  style={{
                    padding: '0.5rem',
                    backgroundColor: '#e8f5e9',
                    border: '1px solid #4caf50',
                    borderRadius: '4px',
                  }}
                >
                  ✓ Program is valid!
                </div>
              )}
            </div>
          )}

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            disabled={!validationResult?.isValid}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              backgroundColor: validationResult?.isValid ? '#4caf50' : '#ccc',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: validationResult?.isValid ? 'pointer' : 'not-allowed',
              marginBottom: '1rem',
            }}
          >
            Confirm Program
          </button>

          <div style={{ paddingTop: '1rem', paddingBottom: '1rem', marginBottom: '2rem' }}>
            {/* Sample Workout Buttons */}
            <div style={{ marginTop: '0.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Load Sample Programs</h3>
            </div>
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {Object.entries(sampleWorkouts).map(([name, content]) => (
                <button
                  key={name}
                  onClick={() => setInputText(content)}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.9rem',
                    backgroundColor: '#2196f3',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>


          {/* Preview Controls */}
          {parsedProgram && parsedProgram.screens.length > 0 && (
            <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              <h3 style={{ fontSize: '1.5rem', marginTop: 0 }}>Preview</h3>

              {/* Screen Selector */}
              {parsedProgram.screens.length > 1 && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ marginRight: '0.5rem' }}>Screen:</label>
                  <select
                    value={selectedPreviewScreen}
                    onChange={(e) => setSelectedPreviewScreen(parseInt(e.target.value))}
                    style={{ padding: '0.25rem' }}
                  >
                    {parsedProgram.screens.map((screen, index) => (
                      <option key={index} value={index}>
                        {screen.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Time Offset Slider */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Time Offset: {Math.floor(previewTimeOffset / 60) > 0 ? `${Math.floor(previewTimeOffset / 60)}min` : ''} {previewTimeOffset % 60 > 0 ? `${previewTimeOffset % 60} sec` : ''}
                </label>
                <input
                  type="range"
                  min="0"
                  max={parsedProgram.screenDuration + 10 || 7200}
                  value={previewTimeOffset}
                  onChange={(e) => setPreviewTimeOffset(parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Preview Display */}
              <div style={{ border: '2px solid #2196f3', borderRadius: '4px', overflow: 'hidden' }}>
                <ProgramScreen
                  programDefinition={parsedProgram}
                  selectedScreen={selectedPreviewScreen}
                  workoutStartTime={workoutStartTime}
                  currentTime={currentTime}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

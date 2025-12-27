# Program Execution Components

## Overview

The Program Execution system is the core of the fitness class application, enabling users to create, parse, and execute timed workout programs. The system manages shared state, displays workout screens, and synchronizes timing across multiple displays.

## Architecture

```
ProgramExecutor (State Manager)
├── ProgramParser (Input & Validation)
│   └── ProgramScreen (Preview)
└── ProgramScreen (Live Display)
    └── ProgramElementGroup (Group Display)
        ├── CyclicText
        ├── YouTube Video
        ├── CountdownTimer
        ├── ProgressBar
        └── CenteredText
```

## Shared Application State

### LocalStorage Schema

**Key**: `programState`

**Value**:
```typescript
interface ProgramState {
  startDateTime: string;  // ISO 8601 datetime with timezone (e.g., "2026-01-01T10:00:00+08:00")
}
```

**Example**:
```json
{
  "startDateTime": "2026-01-01T10:00:00+08:00"
}
```

### State Source Options

The application supports two methods for storing/retrieving state:

1. **LocalStorage**: State stored in browser localStorage
2. **API**: State stored remotely via GET/POST endpoints

## Component: ProgramExecutor

### Purpose
Main orchestration component that manages application state, coordinates program execution, and handles timing synchronization.

### State Variables

```typescript
interface ProgramExecutorState {
  isLive: boolean;           // false = setup mode, true = live execution mode
  programState: ProgramState | null;  // null until workout starts
  programDefinition: ProgramDefinition | null;  // parsed program structure
  selectedScreen: number;    // index of screen to display
  stateSource: 'localStorage' | 'api';
  stateSourceUrl?: string;   // URL for GET/POST if using API
}
```

### Behavior

#### Setup Mode (`isLive = false`)

Displays configuration interface with:

1. **ProgramParser** component
   - Input: `setProgramDefinition` callback
   - Allows user to input and parse program description
   
2. **Screen Selector**
   - Dropdown to choose which screen to display
   - Populated from `programDefinition.screens`
   - Only shown if multiple screens exist

3. **State Source Selector**
   - Radio buttons: LocalStorage or API URL
   - If API selected, text input for GET URL
   
4. **State Source Setter** (Optional)
   - Checkbox to enable state setting
   - If API selected, text input for POST URL
   
5. **Proceed Button**
   - Enabled only when `programDefinition` is valid
   - On click:
     - If state setter is configured: prompt to clear existing state
     - Set `isLive = true`

#### Live Mode (`isLive = true`)

**Phase 1: Waiting for Start** (`programState = null`)

- Poll state source:
  - **LocalStorage**: Every **1 second** (for near real-time updates)
  - **API**: Every **5 seconds**
- Display message: "Waiting for Workout to Start..."
- If state setter enabled:
  - **Start ASAP Button**: Sets workout start time to 15 seconds from now (rounded up to nearest second)
  - **Set Start Time Section**: Manual datetime picker with validation (must be ≥60s in future)
- **Back to Setup Button**: Returns to setup mode (`isLive = false`)

**Phase 2: Running** (`programState != null`)

- Poll state source:
  - **LocalStorage**: Every **1 second** (for near real-time updates)
  - **API**: Every **15 seconds**
- Poll interval enforcement prevents rapid successive calls
- Update `currentTime` every **10ms** (rounded to nearest second)
- Display controls bar at top:
  - **Restart Workout Button** (only if state setter enabled): Sets workout start time to 10 seconds from now (rounded up)
  - **Rewind Button** (only if state setter enabled and workout not concluded): Adds 10 seconds to workout start time
  - **Fast-Forward Button** (only if state setter enabled and workout not concluded): Subtracts 10 seconds from workout start time
  - **Back Button**: Returns to setup mode (`isLive = false`)
  - **Screen Selector Dropdown** (only if multiple screens): Allows switching between screens during workout
- Render `ProgramScreen` component below controls with sound integration:
  - **timingTickers prop**: Provides `tick` and `beep` sound functions
  - Sounds play for timing feedback (see Sound System below)

### TypeScript Interface

```typescript
interface ProgramExecutorProps {
  // No external props - self-contained component
}

interface ProgramDefinition {
  screens: Screen[];
  screenDuration: number;  // total duration in seconds (same for all screens)
}

interface Screen {
  name: string;
  groups: Group[];
  duration: number;  // sum of all group durations
  closingMessage?: string;  // HTML content (parsed from Markdown)
}

interface Group {
  name: string;
  duration: number;  // seconds
  style: 'normal' | 'rest';  // affects styling
  parts: Part[];
}

type Part = 
  | CyclicTextPart
  | YouTubePart
  | CenteredTextPart
  | CenteredShortTextPart
  | GroupCountdownTimerPart;

interface CyclicTextPart {
  type: 'cyclic-text';
  items: CyclicTextItem[];
}

interface CyclicTextItem {
  duration: number;  // seconds
  'center-text': string;
  'right-text': string;
}

interface YouTubePart {
  type: 'youtube';
  id: string;  // YouTube video ID
}

interface CenteredTextPart {
  type: 'centered-text';
  label: string;
}

interface CenteredShortTextPart {
  type: 'centered-short-text';
  label: string;
}

interface GroupCountdownTimerPart {
  type: 'group-countdown-timer';
}
```

## Sound System

### Overview

The application provides audio feedback during live workout execution using the Web Audio API. Sounds are injected as props to maintain separation between preview and live modes.

### Sound Types

**Tick Sound**
- Frequency: 800Hz
- Duration: 50ms
- Volume: Very quiet (0.01)
- Purpose: Subtle feedback for each second during countdown and workout

**Beep Sound**
- Frequency: 1200Hz
- Duration: 250ms
- Volume: Moderate (0.4)
- Purpose: Clear signal for major events

### When Sounds Play

**Tick** (quiet):
- Every second during pre-workout countdown
- Every second during workout (except when beep plays)

**Beep** (loud):
- Workout start (0 seconds elapsed)
- Start of each group
- Start of each item in cyclic text sequences (except first item)
- Workout completion

### Implementation

**Sound Injection Pattern**:
```typescript
// Live mode (ProgramExecutor)
<ProgramScreen
  timingTickers={{
    tick: playTickTone,
    beep: playBeepTone,
  }}
/>

// Preview mode (ProgramParser)
<ProgramScreen
  // timingTickers prop omitted - defaults to no-op functions
/>
```

**Beep Time Calculation**:
- Calculated once during render using `useMemo`
- Stored as `Set<number>` of seconds elapsed
- Includes: workout start, group transitions, cyclic text item transitions

**Files**:
- `lib/utils/sounds.ts`: Sound generation functions
- `components/features/ProgramScreen.tsx`: Sound triggering logic

## Component: ProgramParser

### Purpose
Parses markdown-like program descriptions into structured JSON, validates programs, provides preview functionality, and loads sample workouts.

### Props

```typescript
interface ProgramParserProps {
  setProgramDefinition: (definition: ProgramDefinition | null) => void;
}
```

### Features

1. **Text Input Area**
   - Large textarea for program description
   - Markdown-like syntax (see Input Format below)

2. **Sample Workout Buttons**
   - Buttons below textarea to load pre-defined workouts
   - Loaded from `lib/sample-workouts.tsx`
   - Auto-populates textarea with workout content
   - New workouts can be added to the `sampleWorkouts` object

3. **Real-time Parsing**
   - Parse on input change
   - Display validation errors inline

4. **LocalStorage Persistence**
   - Save last valid program to `localStorage` key: `lastValidProgram`
   - Auto-load on mount

5. **Preview Simulation**
   - Screen selector dropdown (if multiple screens)
   - Time offset slider: 0 to `screenDuration + 10` seconds
   - Auto-advance: Time offset increases by 1 second every 0.25 seconds, wraps to 0 at end
   - Live preview using `ProgramScreen` component with simulated times (no sounds)

5. **Collapsible UI**
   - Implemented as accordion
   - Collapses automatically after "Confirm Program" clicked

6. **Validation Rules**
   - All screens must have equal total duration
   - Total duration ≤ `settings.groupDurationLimitInSeconds` seconds
   - If group has cyclic-text, `groupDuration` must be integer multiple of sum of cyclic item durations
   - All durations must be positive integers
   - YouTube IDs must be valid format

7. **Confirm Button**
   - Positioned above preview section
   - Enabled only when program is valid
   - On click: call `setProgramDefinition(parsedProgram)` and collapse parser

### Input Format

Based on `program001-input.md`:

```markdown
# Screen: [Screen Name]

## Group: [Group Name]

Duration: [N] seconds

Style: [normal|rest]  # optional, defaults to "normal"

Cyclic Text Sequence:
 - [duration] seconds | [center-text] | [right-text]
 - [duration] seconds | [center-text] | [right-text]

Centered Short Text: [label]

Centered Text: [label]  # same as Centered Short Text

Video: https://www.youtube.com/shorts/[VIDEO_ID]

Group Countdown Timer: true
```

### Parsing Rules

1. **Screens**: Defined by `# Screen: [name]`
2. **Groups**: Defined by `## Group: [name]`
3. **Duration**: `Duration: N seconds` (positive integer)
4. **Style**: `Style: rest` or `Style: normal` (case-insensitive, defaults to normal)
5. **Cyclic Text**: Multi-line block starting with `Cyclic Text Sequence:`
   - Each item: `- [N] seconds | [text1] | [text2]`
6. **Centered Text/Short Text**: `Centered Text:` or `Centered Short Text:` followed by label
   - Empty labels allowed (empty string)
7. **Video**: Extract ID from YouTube URL (shorts or regular)
8. **Countdown**: `Group Countdown Timer: true`
9. **Closing Message**: Optional per-screen section defined by `## Closing Message`
   - All content after this header until next screen or EOF becomes the closing message
   - Supports Markdown formatting (headers, bold, italic, lists, tables)
   - Converted to HTML for display

### Validation

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

function validateProgram(definition: ProgramDefinition): ValidationResult {
  const errors: string[] = [];
  
  // Check all screens have same duration
  const durations = definition.screens.map(s => s.duration);
  if (new Set(durations).size > 1) {
    errors.push("All screens must have the same total duration");
  }
  
  // Check duration limit
  const maxDuration = appConfig.settings.groupDurationLimitInSeconds;
  if (durations.some(d => d > maxDuration)) {
    errors.push(`Screen duration cannot exceed ${maxDuration} seconds`);
  }
  
  // Check cyclic text alignment at group level
  for (const screen of definition.screens) {
    for (const group of screen.groups) {
      const cyclicPart = group.parts.find(p => p.type === 'cyclic-text');
      if (cyclicPart) {
        const totalCyclicDuration = cyclicPart.items
          .reduce((sum, item) => sum + item.duration, 0);
        if (group.duration % totalCyclicDuration !== 0) {
          errors.push(
            `Group "${group.name}": duration must be integer multiple of cyclic text total`
          );
        }
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings: []
  };
}
```

## Component: ProgramScreen

### Purpose
Displays a single screen (sequence of groups) with proper timing and transitions.

### Props

```typescript
interface ProgramScreenProps {
  programDefinition: ProgramDefinition;
  selectedScreen: number;  // index into programDefinition.screens
  workoutStartTime: Date;
  currentTime: Date;
}
```

### Behavior

1. **Calculate Group Timings**
   ```typescript
   const screen = programDefinition.screens[selectedScreen];
   const groupTimings: GroupTiming[] = [];
   let cumulativeTime = 0;
   
   for (const group of screen.groups) {
     groupTimings.push({
       group,
       startTime: new Date(workoutStartTime.getTime() + cumulativeTime * 1000),
       endTime: new Date(workoutStartTime.getTime() + (cumulativeTime + group.duration) * 1000),
     });
     cumulativeTime += group.duration;
   }
   
   const totalScreenDuration = cumulativeTime;
   ```

2. **Determine Current Group**
   ```typescript
   const currentGroup = groupTimings.find(
     gt => gt.startTime <= currentTime && currentTime < gt.endTime
   );
   ```

3. **Render Logic**
   - If `currentGroup` exists: render `ProgramElementGroup` with:
     - `workoutStartTime`
     - `groupStartTime` = currentGroup.startTime
     - `currentTime`
     - `totalScreenDuration`
     - `groupDescription` = currentGroup.group
   - If `currentTime >= lastGroup.endTime`: render closing message (Markdown, vertically centered)
   - Otherwise: render "Workout not started yet" or "Waiting..."

## Component: ProgramElementGroup

### Purpose
Renders a single group's content (exercises, timers, progress bars, etc.) with real-time updates.

### Props

```typescript
interface ProgramElementGroupProps {
  workoutStartTime: Date;
  groupStartTime: Date;
  currentTime: Date;
  totalScreenDuration: number;  // seconds
  groupDescription: Group;
}
```

### Calculated Values

```typescript
const timeElapsedInGroup = (currentTime.getTime() - groupStartTime.getTime()) / 1000;
const timeElapsedInWorkout = (currentTime.getTime() - workoutStartTime.getTime()) / 1000;
```

### Rendering Parts

#### 1. Cyclic Text (`type: 'cyclic-text'`)

Display cycling text with countdown:

```tsx
// Determine current item
let accumulatedTime = 0;
let currentItem: CyclicTextItem | null = null;
let timeLeftInItem = 0;

const totalCycleDuration = items.reduce((sum, item) => sum + item.duration, 0);
const timeInCycle = timeElapsedInGroup % totalCycleDuration;

for (const item of items) {
  if (timeInCycle >= accumulatedTime && timeInCycle < accumulatedTime + item.duration) {
    currentItem = item;
    timeLeftInItem = item.duration - (timeInCycle - accumulatedTime);
    break;
  }
  accumulatedTime += item.duration;
}

// Render
<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '2rem' }}>
  <span>{Math.ceil(timeLeftInItem)}s</span>
  <span>{currentItem['center-text']}</span>
  <span>{currentItem['right-text']}</span>
</div>
```

#### 2. YouTube Video (`type: 'youtube'`)

Embedded YouTube player (looping, autoplay):

```tsx
<iframe
  width="100%"
  height="400"
  src={`https://www.youtube.com/embed/${part.id}?autoplay=1&loop=1&playlist=${part.id}&mute=1`}
  allow="autoplay; encrypted-media"
  allowFullScreen
/>
```

#### 3. Centered Text (`type: 'centered-text'` or `'centered-short-text'`)

```tsx
<div style={{ textAlign: 'center', fontSize: '1.5rem', padding: '1rem' }}>
  {part.label}
</div>
```

#### 4. Group Countdown Timer (`type: 'group-countdown-timer'`)

Shows time remaining in current group:

```tsx
const timeLeft = groupDescription.duration - timeElapsedInGroup;
<div style={{ textAlign: 'center', fontSize: '3rem', fontFamily: 'monospace' }}>
  {formatTime(Math.ceil(timeLeft))}
</div>
```

#### 5. Overall Progress Bar (if needed)

Shows progress through entire workout:

```tsx
const progress = (timeElapsedInWorkout / totalScreenDuration) * 100;
<div style={{ width: '100%', height: '20px', background: '#ddd' }}>
  <div style={{ width: `${progress}%`, height: '100%', background: '#4caf50' }} />
</div>
```

### Styling Based on Group Style

Apply different styling based on `groupDescription.style`:

```tsx
const containerStyle = groupDescription.style === 'rest'
  ? { backgroundColor: '#e3f2fd', color: '#1976d2' }  // Light blue for rest
  : { backgroundColor: '#ffffff', color: '#000000' };  // White for normal
```

## Configuration Updates

Add to `config/app-config.ts`:

```typescript
interface AppConfig {
  // ... existing config
  settings: {
    groupDurationLimitInSeconds: number;  // default: 7200
  };
}

export const appConfig: AppConfig = {
  // ... existing config
  settings: {
    groupDurationLimitInSeconds: 7200,
  },
};
```

## Utility Functions

```typescript
// Round to nearest second
function roundToNearestSecond(date: Date): Date {
  return new Date(Math.round(date.getTime() / 1000) * 1000);
}

// Format seconds as MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Extract YouTube ID from URL
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/shorts\/)([\w-]+)/,
    /(?:youtube\.com\/watch\?v=)([\w-]+)/,
    /(?:youtu\.be\/)([\w-]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}
```

## Example Usage

```tsx
// In app/page.tsx
'use client';

import { useState } from 'react';
import ProgramExecutor from '@/components/features/ProgramExecutor';

export default function HomePage() {
  return <ProgramExecutor />;
}
```

## Testing Considerations

1. **Time Simulation**: Test with mock dates to verify timing logic
2. **State Persistence**: Test LocalStorage save/load
3. **Validation**: Test all validation rules with edge cases
4. **Cyclic Text**: Verify correct cycling and countdown
5. **Multi-Screen**: Test screen selection and transitions
6. **API Integration**: Mock API calls for state source/setter
7. **Responsive**: Test on different screen sizes
8. **Performance**: Verify 10ms updates don't cause lag

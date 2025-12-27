// Program Execution Type Definitions

export interface ProgramState {
  startDateTime: string; // ISO 8601 datetime with timezone (e.g., "2026-01-01T10:00:00+08:00")
}

export interface ProgramDefinition {
  screens: Screen[];
  screenDuration: number; // total duration in seconds (same for all screens)
}

export interface Screen {
  name: string;
  groups: Group[];
  duration: number; // sum of all group durations
  closingMessage?: string; // HTML content from Markdown
}

export interface Group {
  name: string;
  duration: number; // seconds
  style: 'normal' | 'rest'; // affects styling
  parts: Part[];
}

export type Part =
  | CyclicTextPart
  | YouTubePart
  | CenteredTextPart
  | CenteredShortTextPart
  | GroupCountdownTimerPart;

export interface CyclicTextPart {
  type: 'cyclic-text';
  items: CyclicTextItem[];
}

export interface CyclicTextItem {
  duration: number; // seconds
  'center-text': string;
  'right-text': string;
}

export interface YouTubePart {
  type: 'youtube';
  id: string; // YouTube video ID
}

export interface CenteredTextPart {
  type: 'centered-text';
  label: string;
}

export interface CenteredShortTextPart {
  type: 'centered-short-text';
  label: string;
}

export interface GroupCountdownTimerPart {
  type: 'group-countdown-timer';
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface GroupTiming {
  group: Group;
  startTime: Date;
  endTime: Date;
}

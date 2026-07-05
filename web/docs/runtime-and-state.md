# Runtime And State

## Main Flow

`ProgramExecutor` has two top-level modes:

1. setup mode
2. live mode

In setup mode the user:

- enters or loads a workout program;
- reviews parser validation output;
- selects a screen when multiple screens exist;
- chooses a state source (`localStorage` or `api`);
- optionally enables state-setting controls; and
- proceeds into the live display.

## Shared State Model

The shared workout-state schema is:

```ts
interface ProgramState {
  startDateTime: string;
}
```

The frontend uses:

- `programState` as the live workout start marker; and
- `lastValidProgram` in localStorage to persist the last valid program input.

The local workout-state storage key is `programState`.

## Polling Behavior

When live mode is active:

- localStorage state is polled every `1s`;
- API state is polled every `5s` while waiting to start; and
- API state is polled every `15s` after the workout has started.

`ProgramExecutor` also tracks `lastPollTimeRef` so repeated renders do not
trigger rapid extra polls.

## Control Actions

If state setting is enabled, the UI can:

- clear existing state on entry to live mode;
- start ASAP by setting the start time to roughly `15s` in the future;
- set an explicit future start time, but only if it is at least `60s` ahead;
- restart a workout at roughly `10s` in the future; and
- rewind or fast-forward by shifting the stored start time by `10s`.

These operations write either to localStorage or to the API POST endpoint,
depending on the selected state source.

## Screen Runtime

`ProgramScreen` handles three phases:

1. pre-start countdown
2. active group display
3. completion screen with optional closing message HTML

It computes group timing windows from `workoutStartTime`, plays timing sounds,
and renders the currently active group through `ProgramElementGroup`.

## Sound Behavior

`lib/utils/sounds.ts` exposes:

- `playTickTone()` - `800Hz`, quiet, `50ms`
- `playBeepTone()` - `1200Hz`, louder, `250ms`

Sounds are used only in live mode. Preview rendering in `ProgramParser` stays
silent because the sound callbacks are injected by `ProgramExecutor`.

# Program Format

Workout programs are written in a markdown-like plain-text format and parsed by
`lib/parsers/program-parser.ts`.

## Top-Level Structure

Each program must contain at least one screen:

```text
# Screen: Screen Name
```

Each screen contains one or more groups:

```text
## Group: Group Name
Duration: 60 seconds
```

All screens in the same program must have the same total duration. Validation
fails if durations differ.

## Supported Group Fields

Within a group, the parser currently understands:

- `Duration: N seconds`
- `Style: normal` or `Style: rest`
- `Cyclic Text Sequence:`
- `Centered Text: ...`
- `Centered Short Text: ...`
- `Video: <youtube-url>`
- `Group Countdown Timer: true`

## Cyclic Text Sequence

Example:

```text
Cyclic Text Sequence:
 - 90 seconds | superset | 1/3
 - 30 seconds | rest | next 2/3
```

Each item becomes:

```ts
interface CyclicTextItem {
  duration: number;
  "center-text": string;
  "right-text": string;
}
```

Validation requires the group duration to be an integer multiple of the total
cyclic-text duration.

## Closing Message

A screen can end with:

```text
## Closing Message
```

All following lines are captured and converted to inline-styled HTML by a
simple parser that supports:

- headings
- bold and italic text
- bullet lists
- markdown-style tables

The result is stored in `screen.closingMessage` and rendered with
`dangerouslySetInnerHTML` on workout completion.

## Validation Rules

Current validation checks include:

- the program must contain at least one screen;
- each screen must contain at least one group;
- each group duration must be positive;
- screen durations must match across screens;
- screen duration must not exceed
  `appConfig.settings.groupDurationLimitInSeconds`; and
- group style must be `normal` or `rest`.

See also:

- [`examples/program001-input.md`](./examples/program001-input.md)
- [`examples/program001-parsed.json`](./examples/program001-parsed.json)
- [`../lib/sample-workouts.tsx`](../lib/sample-workouts.tsx)

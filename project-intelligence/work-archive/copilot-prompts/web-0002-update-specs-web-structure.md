# Background

Refer `starter.md` for information.

This document uodates and supersedes the prompt in `web-0001-update-specs-web-structure.md`.

The application in question is intended to display the progress of a fitness class where activities are run on the clock.


# Objective

Update the specifications for the web application to reflect the application structure here, and update the documentation accordingly.

Create specifications for TypeScript interfaces based on these.

# Major Parts of the Application

## Shared Application State

The shared application state will be stored in LocalStorage (serialised and deserialised as needed). It will take the form

```
{
  "startDateTime": string  // ISO Date Time (e.g.: "2026-01-01T10:00:00+08:00")
}
```

## `ProgramExecutor`

The `ProgramExecutor` is a component that will execute / run / play a screen for a fitness class, and manage application state.

 - A shared clock for all screens will be based on a shared state that will be polled for (e.g.: every 15 seconds), and this might be through reading from LocalStorage, or making an API call
 - The component will initially have a state variable `isLive` set to `false`, and a state variable `programState` set to `null`
 - When the state variable `isLive` is `false`, the component will display:
   * a `ProgramParser` (see below) used to set the program (in a state variable `programDefinition`, pass in the setter for `programDefinition`)
   * a screen selector (based on what is available from the parsed program if there are multiple screens)
   * workout state source selector (LocalStorage, or URL for a GET call)
   * (optional) workout state source setter (LocalStorage, or URL for a POST call)
   * a proceed button ("Proceed") enabled if the program is valid
   * once "Proceed" is clicked
     (a) if workout state source setter is set, the user will be prompted whether to clear the work out state, if so, the state will be cleared (e.g.: by setting a null value for a URL, or removing the relevant field for LocalStorage)
     (b) the state variable `isLive` set to `true`.
 - Polling for State:
   * While the state variable `isLive` is `true`, and `programState` is `null` the component will poll every 5 seconds based on workout state source selector
   * While the state variable `isLive` is `true`, and `programState` is not `null` the component will poll every 15 seconds based on workout state source selector until 110% of the program duration, after which it will stop
 - Setting the State when Live: While the state variable `isLive` is `true`, and `programState` is `null`, and a workout state source setter is set:
   * "Start ASAP" button: Sets start time to 15 seconds from now (rounded up to nearest second)
   * User will be able to manually set the workout start time to a future (at least 1min in future) time as a timezone aware ISO datetime string (`startDateTime`)
   * Setting either will also set `programState` to `{"startDateTime": startDateTime}`.
 - Running the program when Live (when state variable `isLive` is `true`, and `programState` is not `null`)
   * Display controls bar with:
     - "Restart Workout" button (only if state setter enabled): Sets start time to 10 seconds from now (rounded up)
     - "Back" button: Returns to setup UI
     - Screen selector dropdown (only if multiple screens exist)
   * Workout Start Time (`workoutStartTime`) will be set using `startDateTime` from `programState`
   * Current Time (`currentTime`) will be set and updated every 10ms using the current time rounded to the nearest second
   * The correct screen to display is determined based on the `programState` (using `startDateTime`), and Screen Start Time (`screenStartTime`) determined as well
   * The following will also be determined based on the current time and the `programState` (using `startDateTime`)
     (a) Workout Start Time (`workoutStartTime`) (use `startDateTime`)
     (c) Current Time (`currentTime`) (use the current time)
   * The following will be passed into the program screen component (`ProgramScreen` below): `workoutStartTime`, `currentTime`


## `ProgramParser`

Inputs:
 - `setProgramDefinition`: a setter for a program

The `ProgramParser` is component that will parse a text description of a fitness program.

Each description which will describe:
 - One of more screens (screens will each display groups of components)
 - Groups where each group will contain some of the following vertically stacked
   * video: exercises (e.g.: a name and a looping embedded YouTube video / looping video)
   * cyclic text (e.g.: "2/3"; "Current set: 1/4") that start when the group is displayed ("mounted"), and update based on the time since the group was displayed ("mounted"); this will be defined by a list of triples where each triple is a duration (positive integer), a text value, and another text value
   * overall progress bar (e.g.: a progress bar for the entire workout)
   * timers (e.g.: time left for the current set; time left for the whole program) that start when the group is displayed ("mounted"), and update based on the time since the group was displayed ("mounted")
   * banner messages
 - The description of each group will contain a description of how long it will be displayed (positive integer providing time in seconds) (`groupDuration`), and if cyclic text is defined, `groupDuration` must be an integer multiple of it.
 - The description of each group will contain an optional `style` specification which defaults to `normal`. This will affect how components are styled.
 - Each screen will be defined by a sequence of groups, and all screens should have the same total `groupDuration`, and the total should not exceed a configurable limit (add `settings.groupDurationLimitInSeconds` to `AppConfig`, with a default of `7200`)
 - Each screen can have an optional closing message section (defined by `## Closing Message`) which will contain Markdown content. This content appears after all groups and before the next screen or end of file. The parser should convert this Markdown to HTML for display.

The parser will record the most recent valid program entered in LocalStorage.

The parser will also display a simulation of a selected screen (using `ProgramScreen`) at a certain time offset from `workoutStartTime` (with a dropdown to pick the screen if there are multiple screens; and a slider for seconds that ranges from 0 seconds to the screen duration). The preview will auto-advance by 1 second every 0.25 seconds, wrapping back to 0 when it reaches the end.

The component (`ProgramParser`) should be collapsable (e.g.: in an accordion).

A "Confirm Program" button should be available and enabled only when a valid program is entered, positioned above the preview section. When clicked, it will set the program definition using `setProgramDefinition`, after which the component (`ProgramParser`) should be collapsed.

Example of program descriptions and parsed programs are as follows:
 - Program 1
   * Input: /__copilot__/sample-programs/program001-input.md
   * Parsed: /__copilot__/sample-programs/program001-parsed.json


## `ProgramScreen`

The program screen component will display a screen as described above.

The component should use `VerticalContainer` with maxWidth set to `appConfig.settings.maxWidth` (default 800). Add this setting to the AppConfig.

Each screen should display the screen name in large bold centered text (3rem font size) at the top, visible in all states (countdown, running, complete).

Inputs:
 - Workout Start Time (`workoutStartTime`)
 - Current Time (`currentTime`)

Every group will have its Screen Start Time (`groupStartTime`), and Group End Time (`groupEndTime`) determined based on the `groupDuration` and sequence of groups. Total Screen Duration (`totalScreenDuration`) will also be calculated using the total of `groupDuration` for all groups.

The correct group (where `groupStartTime` <= `currentTime` < `groupEndTime` for the group) will be displayed using `ProgramElementGroup`, and the following inputs will be passed in.
 - Workout Start Time (`workoutStartTime`)
 - Group Start Time (`groupStartTime`)
 - Current Time (`currentTime`)
 - Total Screen Duration (`totalScreenDuration`)
 - Group Description (`groupDescription`)

If `currentTime` >= `groupEndTime` the screen's closing message (if defined) will be displayed, vertically centered. Each screen has its own closing message.

## `ProgramElementGroup`

Inputs:
 - Workout Start Time (`workoutStartTime`)
 - Group Start Time (`groupStartTime`)
 - Current Time (`currentTime`)
 - Total Screen Duration (`totalScreenDuration`)
 - Group Description (`groupDescription`)

The program screen component will display a group as described above.

Elements displayed (a repeat of the above)
 - exercises (e.g.: a name and a looping embedded YouTube video / looping video)
 - cyclic text (e.g.: 2/3; "Current set: 1/4") that start when the group is displayed ("mounted"), and update based on the time since the group was displayed ("mounted"); this will be defined by a list of triples where each triple is a duration (positive integer), a text value, and another text value
   * These will be displayed in a cycle, based on the time elapsed since the Screen Start Time (`timeElapsedInSeconds`)
   * The text will cycle through the list of text items and changed after the stipulated duration
   * Flushed to the left will be a countdown timer indicating how much time is left for this element, and fulshed to the right be the defined text
 - overall progress bar (e.g.: a progress bar for the entire workout)
   * This will be based on the time elapsed since the Workout Start Time (`workoutStartTime`)
   * The progress to display will be based on `(currentTime - workoutStartTime) / totalScreenDuration`
 - banner messages will be static text that can be configured to be left/center/right aligned, and have a stated font size

Pass the group `style` into all sub-elements. This will enable styling based on the `style` setting when the need arises.


# Trailer

Follow up based on `trailer.md`.

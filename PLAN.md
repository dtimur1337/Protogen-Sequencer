# Beat Maker & Sampler - Project Brief

## What is this?
A browser-based step sequencer / sampler POC. A grid-based beat maker with 4 groups of 4 lanes,
each lane containing 4 pads. Bass and melodic lanes support per-pad note selection via a mini piano popup.

## Grid Structure
- 4 groups × 4 lanes × 16 pads = 256 steps total
- Each pad is a toggle (on/off)
- Each lane has one baked-in sample assigned to it
- Playback loops through steps 1–16 at the selected BPM

### Groups & Lanes
| Group | Theme | Note selection |
|---|---|---|
| 1 - Drums | Kick, Snare, Hi-Hat, Crash | No |
| 2 - Bass | 4 bass samples | Yes (per pad) |
| 3 - Melodics | 4 lead/pad samples | Yes (per pad) |
| 4 - FX | 4 FX samples | No |

## Audio
- Baked-in WAV samples bundled with the app, hardcoded per lane
- Samples provided from a Teenage Engineering KOII sampler
- Pitch shifting via Web Audio API `playbackRate` for Groups 2 & 3 (based on root note of sample)
- One shared convolution reverb bus (single IR WAV file)
- Global BPM control (range: 60–180)
- Global play / stop

### Per-Lane Controls
- Volume slider (0–100%)
- Reverb send slider (dry/wet 0–100%)

## Note Selection (Groups 2 & 3)
- Right-click a pad to open a mini piano popup (Vuetify dialog)
- Piano spans 2 octaves (e.g. C2–B3)
- Click a key to assign that note to the pad, popup closes
- Assigned note label shown on the pad (e.g. "F#3")
- Default note = root note of the sample

## UI
- Playhead indicator stepping through pads in sync with audio
- Group labels and lane labels (sample name) visible
- Each lane row: sample name | pads | volume slider | reverb slider
- Minimal, dark aesthetic

## Style
- Dark theme (Vuetify dark theme)
- Dark muted blue base, with orange and electric blue highlights and accents
- Retrofuturistic feel and aesthetic

## Tech
- Vue 3 + Vuetify 3
- Tone.js for transport clock and audio scheduling
- Web Audio API for sample playback, pitch shifting, and reverb (ConvolverNode)
- Vite as build tool
- No routing — single page
- No backend — fully client-side

## Out of Scope (for now)
- Save / load patterns
- Per-pad effects (effects are per-lane only)
- Multiple patterns or scenes
- MIDI input/output
- More than 16 steps per lane
- Multiple reverb types

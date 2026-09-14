<template>
  <div class="piano-roll-group">
    <!-- Sample selector + controls -->
    <div class="roll-toolbar">
      <div class="sample-tabs" role="group" :aria-label="`${group.name} sample selection`">
        <button
          v-for="lane in group.lanes"
          :key="lane.id"
          class="sample-tab"
          :class="{ active: selectedSample[group.id] === lane.id }"
          :aria-pressed="selectedSample[group.id] === lane.id"
          :aria-label="`Select ${lane.name}`"
          @click="setSelectedSample(group.id, lane.id)"
        >
          {{ lane.name }}
        </button>
      </div>

      <div class="roll-controls">
        <div class="ctrl-row">
          <span class="ctrl-label">VOL</span>
          <v-slider
            v-model="laneSettings[selectedSample[group.id]].volume"
            min="0" max="100" step="1"
            hide-details density="compact"
            :color="group.color"
            class="ctrl-slider"
            thumb-size="12"
            :aria-label="`Volume for ${group.name}`"
          />
        </div>
        <div class="ctrl-row">
          <span class="ctrl-label">REV</span>
          <v-slider
            v-model="laneSettings[selectedSample[group.id]].reverbSend"
            min="0" max="100" step="1"
            hide-details density="compact"
            color="secondary"
            class="ctrl-slider"
            thumb-size="12"
            :aria-label="`Reverb for ${group.name}`"
          />
        </div>
      </div>
    </div>

    <!-- Piano roll grid -->
    <div
      class="roll-grid"
      role="grid"
      :aria-label="`${group.name} piano roll`"
      @mouseup="endDrag"
      @mouseleave="endDrag"
    >
      <div
        v-for="note in displayNotes"
        :key="note"
        class="note-row"
        :class="{
          'note-row--black': isBlack(note),
          'note-row--c':     isC(note),
        }"
        role="row"
        :aria-label="note"
      >
        <!-- Piano key strip -->
        <div
          class="key-strip"
          :class="{ 'key-strip--black': isBlack(note), 'key-strip--c': isC(note) }"
          role="presentation"
        >
          <span class="key-name">{{ keyLabel(note) }}</span>
        </div>

        <!-- Step area: transparent click grid + note bars -->
        <div class="step-area">
          <!-- Interaction layer (transparent cells for mouse events) -->
          <div class="click-grid">
            <div v-for="g in 4" :key="g" class="step-group">
              <button
                v-for="s in 4"
                :key="s"
                class="grid-cell"
                :class="{ 'grid-cell--current': currentStep === si(g, s) }"
                :aria-label="`${note} step ${si(g, s) + 1}, ${isActive(noteIdx(note), si(g, s)) ? 'on' : 'off'}`"
                :aria-pressed="isActive(noteIdx(note), si(g, s))"
                role="gridcell"
                @mousedown.prevent="startDrag(noteIdx(note), si(g, s))"
                @mouseenter="enterPad(noteIdx(note), si(g, s))"
              />
            </div>
          </div>

          <!-- Visual note bars (no pointer events) -->
          <div class="note-layer" aria-hidden="true">
            <div
              v-for="bar in rowNotes(noteIdx(note))"
              :key="bar.startStep"
              class="note-bar"
              :class="{ 'note-bar--current': currentStep >= bar.startStep && currentStep < bar.startStep + bar.duration }"
              :style="{ ...noteBarStyle(bar), '--group-color': group.color }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onUnmounted } from 'vue'
import { useSequencer, PIANO_NOTES } from '../composables/useSequencer'

const STEPS = 16
const PAD_W = 36   // px — must match .grid-cell width
const GAP_IN = 4   // px — gap within a step-group
const GAP_OUT = 8  // px — gap between step-groups
// x-offset of step S from left edge of step-area
function stepX(s) {
  const grp = Math.floor(s / 4)
  const pos = s % 4
  return grp * (4 * PAD_W + 3 * GAP_IN + GAP_OUT) + pos * (PAD_W + GAP_IN)
}

const props = defineProps({ group: { type: Object, required: true } })

const { pianoRoll, selectedSample, laneSettings, currentStep, setPianoNote, setSelectedSample } = useSequencer()

const displayNotes = computed(() => [...PIANO_NOTES].reverse())
const noteIndexMap  = Object.fromEntries(PIANO_NOTES.map((n, i) => [n, i]))

function noteIdx(note) { return noteIndexMap[note] }
function si(g, s) { return (g - 1) * 4 + (s - 1) }

const BLACK_NAMES = new Set(['C#', 'D#', 'F#', 'G#', 'A#'])
function isBlack(note) { return BLACK_NAMES.has(note.match(/^([A-G]#?)/)?.[1] ?? '') }
function isC(note)     { return /^C\d$/.test(note) }
function keyLabel(note) {
  if (isC(note)) return note
  return note.replace(/\d$/, '')
}

// --- Data helpers ---
function rowNotes(ni) {
  const row = pianoRoll[props.group.id][ni]
  const out = []
  for (let s = 0; s < STEPS; s++) {
    if (row[s] > 0) out.push({ startStep: s, duration: row[s] })
  }
  return out
}

function isActive(ni, stepIdx) {
  const row = pianoRoll[props.group.id][ni]
  if (row[stepIdx] > 0) return true
  for (let s = 0; s < stepIdx; s++) {
    if (row[s] > 0 && s + row[s] > stepIdx) return true
  }
  return false
}

function isCovered(ni, stepIdx) {
  const row = pianoRoll[props.group.id][ni]
  for (let s = 0; s < stepIdx; s++) {
    if (row[s] > 0 && s + row[s] > stepIdx) return true
  }
  return false
}

function eraseAtOrCovering(ni, stepIdx) {
  const row = pianoRoll[props.group.id][ni]
  if (row[stepIdx] > 0) { setPianoNote(props.group.id, ni, stepIdx, 0); return }
  for (let s = 0; s < stepIdx; s++) {
    if (row[s] > 0 && s + row[s] > stepIdx) { setPianoNote(props.group.id, ni, s, 0); return }
  }
}

// --- Note bar rendering ---
function noteBarStyle(bar) {
  const x0 = stepX(bar.startStep)
  const x1 = stepX(bar.startStep + bar.duration - 1) + PAD_W
  return { left: x0 + 'px', width: (x1 - x0) + 'px' }
}

// --- Drag-to-paint ---
const drag = ref({ active: false, noteIndex: null, startStep: null, mode: 'create' })

function startDrag(ni, stepIdx) {
  const row = pianoRoll[props.group.id][ni]
  if (row[stepIdx] > 0 || isCovered(ni, stepIdx)) {
    eraseAtOrCovering(ni, stepIdx)
    drag.value = { active: true, noteIndex: ni, startStep: stepIdx, mode: 'erase' }
  } else {
    setPianoNote(props.group.id, ni, stepIdx, 1)
    drag.value = { active: true, noteIndex: ni, startStep: stepIdx, mode: 'create' }
  }
}

function enterPad(ni, stepIdx) {
  if (!drag.value.active || drag.value.noteIndex !== ni) return
  if (drag.value.mode === 'create') {
    if (stepIdx <= drag.value.startStep) return
    // Don't extend into an existing note
    const row = pianoRoll[props.group.id][ni]
    for (let s = drag.value.startStep + 1; s <= stepIdx; s++) {
      if (row[s] > 0) return
    }
    setPianoNote(props.group.id, ni, drag.value.startStep, stepIdx - drag.value.startStep + 1)
  } else {
    eraseAtOrCovering(ni, stepIdx)
  }
}

function endDrag() { drag.value.active = false }

window.addEventListener('mouseup', endDrag)
onUnmounted(() => window.removeEventListener('mouseup', endDrag))
</script>

<style scoped>
.piano-roll-group { padding: 6px 0; }

/* --- Toolbar --- */
.roll-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.sample-tabs {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.sample-tab {
  font-family: 'Courier New', monospace;
  font-size: 10px;
  letter-spacing: 0.1em;
  padding: 4px 10px;
  border: 1px solid #253550;
  border-radius: 2px;
  background: #0d1522;
  color: #5a7a9a;
  cursor: pointer;
  transition: background 0.1s, border-color 0.1s, color 0.1s;
  text-transform: uppercase;
}
.sample-tab:hover { border-color: #3a5878; color: #7a9ab8; }
.sample-tab.active {
  border-color: v-bind('group.color');
  background: color-mix(in srgb, v-bind('group.color') 15%, #0d1522);
  color: v-bind('group.color');
}

.roll-controls { display: flex; gap: 12px; flex: 1; max-width: 340px; }
.ctrl-row { display: flex; align-items: center; gap: 6px; flex: 1; }
.ctrl-label {
  font-family: 'Courier New', monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  font-weight: 600;
  color: #8ab4d8;
  flex-shrink: 0;
  width: 28px;
}
.ctrl-slider { flex: 1; }

/* --- Roll grid --- */
.roll-grid {
  display: flex;
  flex-direction: column;
  width: fit-content;
  user-select: none;
}

.note-row {
  display: flex;
  align-items: stretch;
  gap: 12px;
  height: 26px;
}
.note-row--black { background: #090e18; }
.note-row--c     { border-top: 1px solid #253550; }

/* --- Key strip --- */
.key-strip {
  width: 110px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding-left: 6px;
  background: #18283e;
  border-right: 2px solid #2a4060;
}
.key-strip--black {
  background: linear-gradient(to right, #0b1522 0%, #0b1522 65%, #13202f 65%);
  padding-left: 18px;
  border-right-color: #1a2845;
}
.key-strip--c { border-top: 1px solid #4a70a0; }

.key-name {
  font-family: 'Courier New', monospace;
  font-size: 9px;
  color: #7ab0d4;
  pointer-events: none;
  white-space: nowrap;
}
.note-row--c .key-name       { color: #a8d4f0; font-weight: 700; }
.key-strip--black .key-name  { color: #4a6a88; font-size: 8px; }

/* --- Step area --- */
.step-area {
  position: relative;
  width: 648px;   /* 4*(4*36+3*4+8) = 648 */
  flex-shrink: 0;
}

/* --- Click grid (transparent interaction layer) --- */
.click-grid {
  display: flex;
  gap: 8px;
  height: 100%;
}
.step-group { display: flex; gap: 4px; }

.grid-cell {
  width: 36px;
  height: 100%;
  background: #0e1624;
  border: 1px solid #1e2d45;
  border-radius: 2px;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  transition: background 0.04s, border-color 0.04s;
}
.grid-cell:hover       { border-color: #2a4060; background: #14203a; }
.grid-cell--current    { border-color: #ffffff28; background: #12203a; }

/* --- Note visual layer --- */
.note-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.note-bar {
  position: absolute;
  top: 2px;
  bottom: 2px;
  border-radius: 3px;
  background: color-mix(in srgb, var(--group-color) 42%, #0d1522);
  border: 1px solid var(--group-color);
  box-shadow: 0 0 5px color-mix(in srgb, var(--group-color) 50%, transparent);
}
.note-bar--current {
  background: color-mix(in srgb, var(--group-color) 68%, #0d1522);
  box-shadow: 0 0 10px color-mix(in srgb, var(--group-color) 78%, transparent);
}
</style>

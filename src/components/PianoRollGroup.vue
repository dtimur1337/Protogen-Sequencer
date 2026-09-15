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

    </div>

    <!-- Piano roll: fixed key column + scrollable step column -->
    <div class="roll-body" @mouseup="endDrag" @mouseleave="endDrag">
      <!-- Keys (fixed left) -->
      <div class="key-col">
        <template v-for="note in displayNotes" :key="'k-' + note">
          <div v-if="isC(note)" class="octave-sep" aria-hidden="true" />
          <button
            class="key-strip"
            :class="{ 'key-strip--black': isBlack(note), 'key-strip--c': isC(note) }"
            :aria-label="`Play ${note}`"
            @mousedown.prevent="previewNote(group.id, note)"
          >
            <span class="key-name">{{ keyLabel(note) }}</span>
          </button>
        </template>
      </div>

      <!-- Steps (scrollable) -->
      <div class="steps-scroll" ref="stepsScrollRef" @scroll.passive="onScroll">
        <div class="steps-inner" role="grid" :aria-label="`${group.name} piano roll`">
          <template v-for="note in displayNotes" :key="'s-' + note">
            <div v-if="isC(note)" class="octave-sep" aria-hidden="true" />
            <div class="step-row" :class="{ 'step-row--black': isBlack(note) }" role="row" :aria-label="note">
              <div class="step-area" :style="{ width: stepAreaWidth + 'px' }">
                <div class="click-grid">
                  <div v-for="g in numGroups" :key="g" class="step-group">
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
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useSequencer, PIANO_NOTES } from '../composables/useSequencer'
import { useSyncScroll } from '../composables/useSyncScroll'

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

const { pianoRoll, selectedSample, currentStep, steps, setPianoNote, setSelectedSample, previewNote } = useSequencer()
const { register, unregister, onScroll } = useSyncScroll()
const stepsScrollRef = ref(null)
onMounted(() => register(stepsScrollRef.value))
onUnmounted(() => { unregister(stepsScrollRef.value); window.removeEventListener('mouseup', endDrag) })

const numGroups = computed(() => steps.value / 4)
const stepAreaWidth = computed(() => {
  const n = numGroups.value
  return n * (4 * PAD_W + 3 * GAP_IN) + (n - 1) * GAP_OUT
})

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
  for (let s = 0; s < steps.value; s++) {
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
</script>

<style scoped>
.piano-roll-group { padding: 0 0 6px; }

/* --- Toolbar — styled as transport bar --- */
.roll-toolbar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 8px 16px;
  background: #0d1420;
  border-top: 1px solid #1a2540;
  border-bottom: 1px solid #1a2540;
  margin: 6px 0 14px -14px;
  width: calc(100% + 14px);
  box-sizing: border-box;
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
  color: #7a9ab8;
  cursor: pointer;
  transition: background 0.1s, border-color 0.1s, color 0.1s;
  text-transform: uppercase;
}
.sample-tab:hover { border-color: #3a5878; color: #a8c8e0; }
.sample-tab.active {
  border-color: v-bind('group.color');
  background: color-mix(in srgb, v-bind('group.color') 15%, #0d1522);
  color: v-bind('group.color');
}

/* --- Two-column roll layout --- */
.roll-body {
  display: flex;
  gap: 12px;
  user-select: none;
}

.key-col {
  width: 110px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.steps-scroll {
  flex: 1;
  overflow-x: auto;
  scrollbar-width: none;
  min-width: 0;
}
.steps-scroll::-webkit-scrollbar { display: none; }

.steps-inner {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.step-row {
  height: 24px;
}
.step-row--black { background: #090e18; }

.octave-sep {
  height: 1px;
  background: #253550;
  opacity: 0.5;
  margin: 2px 0;
}

/* --- Key strip (now a button for audition) --- */
.key-strip {
  width: 110px;
  height: 24px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding-left: 6px;
  background: #18283e;
  border: none;
  border-right: 2px solid #2a4060;
  cursor: pointer;
  transition: background 0.06s;
}
.key-strip:hover,
.key-strip:active {
  background: #223450;
}
.key-strip--black {
  background: linear-gradient(to right, #0b1522 0%, #0b1522 65%, #13202f 65%);
  padding-left: 18px;
  border-right-color: #1a2845;
}
.key-strip--black:hover,
.key-strip--black:active {
  background: linear-gradient(to right, #152235 0%, #152235 65%, #1a2d40 65%);
}
.key-strip--c {}

.key-name {
  font-family: 'Courier New', monospace;
  font-size: 10px;
  color: #7ab0d4;
  pointer-events: none;
  white-space: nowrap;
}
.key-strip--c .key-name      { color: #a8d4f0; font-weight: 700; }
.key-strip--black .key-name  { color: #5a8aaa; font-size: 10px; }

/* --- Step area --- */
.step-area {
  position: relative;
  flex-shrink: 0;
  height: 100%;
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

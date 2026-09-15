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
import { useTheme } from '../composables/useTheme'

const PAD_W = 36
const GAP_IN = 4
const GAP_OUT = 8
function stepX(s) {
  const grp = Math.floor(s / 4)
  const pos = s % 4
  return grp * (4 * PAD_W + 3 * GAP_IN + GAP_OUT) + pos * (PAD_W + GAP_IN)
}

const props = defineProps({ group: { type: Object, required: true } })

const { pianoRoll, selectedSample, currentStep, steps, setPianoNote, setSelectedSample, previewNote } = useSequencer()
const { register, unregister, onScroll } = useSyncScroll()
const { isDark } = useTheme()
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

function noteBarStyle(bar) {
  const x0 = stepX(bar.startStep)
  const x1 = stepX(bar.startStep + bar.duration - 1) + PAD_W
  return { left: x0 + 'px', width: (x1 - x0) + 'px' }
}

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

.roll-toolbar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 8px 16px;
  background: var(--c-surf);
  border-top: 1px solid var(--c-border);
  border-bottom: 1px solid var(--c-border);
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
  border: 1px solid var(--c-border-2);
  border-radius: 2px;
  background: var(--c-surf-lo);
  color: var(--c-text-2);
  cursor: pointer;
  transition: background 0.1s, border-color 0.1s, color 0.1s;
  text-transform: uppercase;
}
.sample-tab:hover { border-color: var(--c-border-3); color: var(--c-text-1); }
.sample-tab.active {
  border-color: v-bind('group.color');
  background: color-mix(in srgb, v-bind('group.color') 15%, var(--c-surf-lo));
  color: v-bind("isDark ? group.color : '#182030'");
}

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

.octave-sep {
  height: 1px;
  background: var(--c-border-2);
  opacity: 0.5;
  margin: 2px 0;
}

.key-strip {
  width: 110px;
  height: 24px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding-left: 6px;
  background: var(--c-key-w);
  border: none;
  cursor: pointer;
  transition: background 0.06s;
}
.key-strip:hover,
.key-strip:active {
  background: var(--c-key-w-h);
}
.key-strip--black {
  background: linear-gradient(to right, var(--c-key-b) 0%, var(--c-key-b) 65%, var(--c-key-b-2) 65%);
  padding-left: 18px;
}
.key-strip--black:hover,
.key-strip--black:active {
  background: linear-gradient(to right, var(--c-key-b-h) 0%, var(--c-key-b-h) 65%, var(--c-key-w) 65%);
}
.key-strip--c {}

.key-name {
  font-family: 'Courier New', monospace;
  font-size: 10px;
  color: var(--c-key-text);
  pointer-events: none;
  white-space: nowrap;
}
.key-strip--c .key-name      { color: var(--c-key-c-text); font-weight: 700; }
.key-strip--black .key-name  { color: var(--c-key-b-text); font-size: 10px; }

.step-area {
  position: relative;
  flex-shrink: 0;
  height: 100%;
}

.click-grid {
  display: flex;
  gap: 8px;
  height: 100%;
}
.step-group { display: flex; gap: 4px; }

.grid-cell {
  width: 36px;
  height: 100%;
  background: var(--c-pad);
  border: 1px solid var(--c-border-4);
  border-radius: 2px;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  transition: background 0.04s, border-color 0.04s;
}
.grid-cell:hover       { border-color: var(--c-border-5); background: var(--c-pad-hover); }
.grid-cell--current    { border-color: color-mix(in srgb, var(--c-text-1) 16%, transparent); background: var(--c-pad-cur); }

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
  background: color-mix(in srgb, var(--group-color) 42%, var(--c-surf-lo));
  border: 1px solid var(--group-color);
  box-shadow: 0 0 5px color-mix(in srgb, var(--group-color) 50%, transparent);
}
.note-bar--current {
  background: color-mix(in srgb, var(--group-color) 68%, var(--c-surf-lo));
  box-shadow: 0 0 10px color-mix(in srgb, var(--group-color) 78%, transparent);
}
</style>

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
        v-for="(note, di) in displayNotes"
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
          :aria-label="`${note} key`"
          role="presentation"
        >
          <span class="key-name">{{ keyLabel(note) }}</span>
        </div>

        <!-- 16 step buttons in 4 groups -->
        <div class="step-row">
          <div v-for="g in 4" :key="g" class="step-group">
            <button
              v-for="s in 4"
              :key="s"
              class="roll-pad"
              :class="{
                'roll-pad--active':         pianoRoll[group.id][noteIdx(note)][si(g, s)],
                'roll-pad--current':        currentStep === si(g, s),
                'roll-pad--active-current': pianoRoll[group.id][noteIdx(note)][si(g, s)] && currentStep === si(g, s),
                'roll-pad--black':          isBlack(note),
              }"
              :style="{ '--group-color': group.color }"
              :aria-label="`${note} step ${si(g, s) + 1}, ${pianoRoll[group.id][noteIdx(note)][si(g, s)] ? 'on' : 'off'}`"
              :aria-pressed="pianoRoll[group.id][noteIdx(note)][si(g, s)]"
              role="gridcell"
              @mousedown.prevent="startDrag(noteIdx(note), si(g, s))"
              @mouseenter="enterPad(noteIdx(note), si(g, s))"
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

const props = defineProps({
  group: { type: Object, required: true },
})

const { pianoRoll, selectedSample, laneSettings, currentStep, setPianoNote, setSelectedSample } = useSequencer()

const displayNotes = computed(() => [...PIANO_NOTES].reverse())
const noteIndexMap  = Object.fromEntries(PIANO_NOTES.map((n, i) => [n, i]))

function noteIdx(note) { return noteIndexMap[note] }
function si(g, s) { return (g - 1) * 4 + (s - 1) }

const BLACK_NAMES = new Set(['C#', 'D#', 'F#', 'G#', 'A#'])
function isBlack(note) { return BLACK_NAMES.has(note.match(/^([A-G]#?)/)?.[1] ?? '') }
function isC(note)     { return /^C\d$/.test(note) }
function keyLabel(note) {
  if (isC(note)) return note                  // "C3" — full name with octave
  return note.replace(/\d$/, '')              // "D", "F#", "A", etc. — no octave
}

// --- Drag-to-paint ---
const drag = ref({ active: false, noteIndex: null, targetValue: false })

function startDrag(ni, stepIdx) {
  const newVal = !pianoRoll[props.group.id][ni][stepIdx]
  setPianoNote(props.group.id, ni, stepIdx, newVal)
  drag.value = { active: true, noteIndex: ni, targetValue: newVal }
}

function enterPad(ni, stepIdx) {
  if (!drag.value.active || drag.value.noteIndex !== ni) return
  setPianoNote(props.group.id, ni, stepIdx, drag.value.targetValue)
}

function endDrag() {
  drag.value.active = false
}

window.addEventListener('mouseup', endDrag)
onUnmounted(() => window.removeEventListener('mouseup', endDrag))
</script>

<style scoped>
.piano-roll-group {
  padding: 6px 0;
}

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

.sample-tab:hover {
  border-color: #3a5878;
  color: #7a9ab8;
}

.sample-tab.active {
  border-color: v-bind('group.color');
  background: color-mix(in srgb, v-bind('group.color') 15%, #0d1522);
  color: v-bind('group.color');
}

.roll-controls {
  display: flex;
  gap: 12px;
  flex: 1;
  max-width: 340px;
}

.ctrl-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

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
  height: 21px;
}

.note-row--black {
  background: #090e18;
}

.note-row--c {
  border-top: 1px solid #253550;
}

/* --- Key strip --- */
.key-strip {
  width: 110px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding-left: 6px;
  background: #18283e;
  border-right: 2px solid #2a4060;
  position: relative;
}

/* Black keys look shorter: only fill 65% of the strip width */
.key-strip--black {
  background: linear-gradient(to right, #0b1522 0%, #0b1522 65%, #13202f 65%);
  padding-left: 18px;
  border-right-color: #1a2845;
}

.key-strip--c {
  border-top: 1px solid #4a70a0;
}

.key-name {
  font-family: 'Courier New', monospace;
  font-size: 9px;
  color: #7ab0d4;
  pointer-events: none;
  white-space: nowrap;
}

.note-row--c .key-name {
  color: #a8d4f0;
  font-weight: 700;
}

.key-strip--black .key-name {
  color: #4a6a88;
  font-size: 8px;
}

/* --- Step row --- */
.step-row {
  display: flex;
  gap: 8px;
  padding: 2px 0 2px 12px;
  align-items: center;
}

.step-group {
  display: flex;
  gap: 4px;
}

/* --- Roll pad --- */
.roll-pad {
  width: 36px;
  height: 17px;
  border: 1px solid #1e2d45;
  border-radius: 2px;
  background: #0e1624;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  transition: background 0.04s, border-color 0.04s, box-shadow 0.04s;
}

.roll-pad--black {
  background: #090e18;
  border-color: #141e30;
}

.roll-pad:hover {
  border-color: var(--group-color);
  background: #18253a;
}

.roll-pad--current {
  border-color: #ffffff28;
  background: #12203a;
}

.roll-pad--black.roll-pad--current {
  background: #0c1828;
}

.roll-pad--active {
  background: color-mix(in srgb, var(--group-color) 40%, #0d1522);
  border-color: var(--group-color);
  box-shadow: 0 0 5px color-mix(in srgb, var(--group-color) 50%, transparent);
}

.roll-pad--active-current {
  background: color-mix(in srgb, var(--group-color) 65%, #0d1522);
  box-shadow: 0 0 10px color-mix(in srgb, var(--group-color) 75%, transparent);
}
</style>

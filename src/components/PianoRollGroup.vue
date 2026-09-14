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
          <v-slider
            v-model="laneSettings[selectedSample[group.id]].volume"
            min="0" max="100" step="1"
            hide-details density="compact"
            :color="group.color"
            class="ctrl-slider"
            thumb-size="12"
            :aria-label="`Volume for ${group.name}`"
          />
          <span class="ctrl-label" aria-hidden="true">VOL</span>
        </div>
        <div class="ctrl-row">
          <v-slider
            v-model="laneSettings[selectedSample[group.id]].reverbSend"
            min="0" max="100" step="1"
            hide-details density="compact"
            color="secondary"
            class="ctrl-slider"
            thumb-size="12"
            :aria-label="`Reverb for ${group.name}`"
          />
          <span class="ctrl-label" aria-hidden="true">REV</span>
        </div>
      </div>
    </div>

    <!-- Piano roll grid -->
    <div class="roll-grid" role="grid" :aria-label="`${group.name} piano roll`">
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
        <div class="key-strip" aria-hidden="true">
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
              @click="togglePianoNote(group.id, noteIdx(note), si(g, s))"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSequencer, PIANO_NOTES } from '../composables/useSequencer'

const props = defineProps({
  group: { type: Object, required: true },
})

const { pianoRoll, selectedSample, laneSettings, currentStep, togglePianoNote, setSelectedSample } = useSequencer()

const displayNotes = computed(() => [...PIANO_NOTES].reverse()) // top = B4, bottom = C2
const noteIndexMap  = Object.fromEntries(PIANO_NOTES.map((n, i) => [n, i]))

function noteIdx(note) { return noteIndexMap[note] }
function si(g, s) { return (g - 1) * 4 + (s - 1) }

const BLACK_NAMES = new Set(['C#', 'D#', 'F#', 'G#', 'A#'])
function isBlack(note) { return BLACK_NAMES.has(note.match(/^([A-G]#?)/)?.[1] ?? '') }
function isC(note)     { return /^C\d$/.test(note) }
function keyLabel(note) {
  if (isC(note))    return note        // C2, C3, C4
  if (isBlack(note)) return note.replace(/\d$/, '') // C#, D# etc.
  return ''
}
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
  border: 1px solid #1e2d45;
  border-radius: 2px;
  background: #0d1522;
  color: #3a5070;
  cursor: pointer;
  transition: background 0.1s, border-color 0.1s, color 0.1s;
  text-transform: uppercase;
}

.sample-tab:hover {
  border-color: #2a4060;
  color: #5a7090;
}

.sample-tab.active {
  border-color: v-bind('group.color');
  background: color-mix(in srgb, v-bind('group.color') 15%, #0d1522);
  color: v-bind('group.color');
}

.roll-controls {
  display: flex;
  gap: 8px;
  flex: 1;
  max-width: 320px;
}

.ctrl-row {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.ctrl-slider { flex: 1; }

.ctrl-label {
  font-family: 'Courier New', monospace;
  font-size: 9px;
  letter-spacing: 0.12em;
  color: #3a5070;
  flex-shrink: 0;
  width: 24px;
}

/* --- Roll grid --- */
.roll-grid {
  display: flex;
  flex-direction: column;
  width: fit-content;
}

.note-row {
  display: flex;
  align-items: stretch;
  height: 18px;
}

.note-row--black {
  background: #090e18;
}

.note-row--c {
  border-top: 1px solid #1e2d45;
}

/* --- Key strip --- */
.key-strip {
  width: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding-left: 4px;
  background: inherit;
  border-right: 1px solid #1a2540;
}

.note-row:not(.note-row--black) .key-strip {
  background: #111d2e;
}

.note-row--black .key-strip {
  background: #080d18;
  padding-left: 12px;
}

.key-name {
  font-family: 'Courier New', monospace;
  font-size: 8px;
  color: #3a5070;
  pointer-events: none;
  white-space: nowrap;
}

.note-row--c .key-name {
  color: #5a7090;
  font-weight: 700;
}

/* --- Step row --- */
.step-row {
  display: flex;
  gap: 6px;
  padding: 1px 0 1px 6px;
  align-items: center;
}

.step-group {
  display: flex;
  gap: 2px;
}

/* --- Roll pad --- */
.roll-pad {
  width: 28px;
  height: 15px;
  border: 1px solid #141e2e;
  border-radius: 2px;
  background: #0d1522;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  transition: background 0.05s, border-color 0.05s, box-shadow 0.05s;
}

.roll-pad--black {
  background: #090e18;
  border-color: #0f1825;
}

.roll-pad:hover {
  border-color: var(--group-color);
  background: #141f2e;
}

.roll-pad--current {
  border-color: #ffffff18;
  background: #111e30;
}

.roll-pad--black.roll-pad--current {
  background: #0c1522;
}

.roll-pad--active {
  background: color-mix(in srgb, var(--group-color) 35%, #0d1522);
  border-color: var(--group-color);
  box-shadow: 0 0 4px color-mix(in srgb, var(--group-color) 40%, transparent);
}

.roll-pad--active-current {
  background: color-mix(in srgb, var(--group-color) 60%, #0d1522);
  box-shadow: 0 0 8px color-mix(in srgb, var(--group-color) 70%, transparent);
}
</style>

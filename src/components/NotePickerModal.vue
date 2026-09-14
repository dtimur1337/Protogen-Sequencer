<template>
  <v-dialog v-model="notePicker.open" max-width="460" @keydown.esc="notePicker.open = false">
    <v-card color="#0d1420" border style="border-color: #1a2540 !important;">
      <v-card-title class="modal-title">SELECT NOTE</v-card-title>
      <v-card-text class="pb-6">
        <div class="piano">
          <div v-for="octave in [2, 3]" :key="octave" class="octave">
            <span class="octave-label">{{ octave }}</span>
            <div class="keys-wrapper">
              <!-- White keys -->
              <div
                v-for="(wn, wi) in WHITE_KEYS"
                :key="`${wn}${octave}`"
                class="key white-key"
                :class="{ selected: notePicker.laneId && pads[notePicker.laneId]?.[notePicker.stepIndex]?.note === `${wn}${octave}` }"
                @click="selectNote(`${wn}${octave}`)"
              >
                <span class="key-label">{{ wn }}</span>
              </div>
              <!-- Black keys -->
              <div
                v-for="bk in blackKeys(octave)"
                :key="bk.note"
                class="key black-key"
                :class="{ selected: notePicker.laneId && pads[notePicker.laneId]?.[notePicker.stepIndex]?.note === bk.note }"
                :style="{ left: bk.x + 'px' }"
                @click.stop="selectNote(bk.note)"
              >
                <span class="key-label black-label">{{ bk.name }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="current-note" v-if="notePicker.laneId">
          Selected:
          <strong>{{ pads[notePicker.laneId]?.[notePicker.stepIndex]?.note ?? '—' }}</strong>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { useSequencer } from '../composables/useSequencer'

const { notePicker, pads, selectNote } = useSequencer()

const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const WHITE_W = 28
const GAP = 1
const STEP = WHITE_W + GAP
const BLACK_W = 18

// x offset of each black key relative to octave start (left edge of C)
const BLACK_KEY_DEFS = [
  { name: 'C#', x: 1 * STEP - BLACK_W / 2 },
  { name: 'D#', x: 2 * STEP - BLACK_W / 2 },
  { name: 'F#', x: 4 * STEP - BLACK_W / 2 },
  { name: 'G#', x: 5 * STEP - BLACK_W / 2 },
  { name: 'A#', x: 6 * STEP - BLACK_W / 2 },
]

function blackKeys(octave) {
  return BLACK_KEY_DEFS.map((bk) => ({
    ...bk,
    note: `${bk.name}${octave}`,
  }))
}
</script>

<style scoped>
.modal-title {
  font-family: 'Courier New', monospace;
  font-size: 10px !important;
  letter-spacing: 0.2em;
  color: #00d4ff;
  padding-top: 16px;
}

.piano {
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: flex-end;
  margin: 12px 0;
}

.octave {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.octave-label {
  font-family: 'Courier New', monospace;
  font-size: 9px;
  color: #3a5070;
  margin-bottom: 4px;
  letter-spacing: 0.1em;
}

.keys-wrapper {
  position: relative;
  height: 84px;
}

.white-key {
  display: inline-block;
  width: 28px;
  height: 84px;
  background: #d0d8e8;
  border: 1px solid #5a6a7a;
  border-radius: 0 0 3px 3px;
  margin-right: 1px;
  cursor: pointer;
  position: relative;
  vertical-align: top;
  transition: background 0.05s;
}

.white-key:hover {
  background: #e8f0ff;
}

.white-key.selected {
  background: #00d4ff;
  border-color: #00aad4;
}

.black-key {
  position: absolute;
  top: 0;
  width: 18px;
  height: 52px;
  background: #111827;
  border: 1px solid #3a5070;
  border-radius: 0 0 2px 2px;
  cursor: pointer;
  z-index: 2;
  transition: background 0.05s;
}

.black-key:hover {
  background: #1e2d45;
}

.black-key.selected {
  background: #00a4c4;
  border-color: #00d4ff;
}

.key-label {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Courier New', monospace;
  font-size: 7px;
  color: #5a7090;
  pointer-events: none;
  white-space: nowrap;
}

.black-label {
  color: #4a8090;
  font-size: 6px;
}

.current-note {
  text-align: center;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  color: #3a5070;
  margin-top: 8px;
}

.current-note strong {
  color: #00d4ff;
}
</style>

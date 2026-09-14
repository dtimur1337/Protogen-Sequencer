<template>
  <div class="lane-row">
    <div class="lane-name" :style="{ color: dimColor }">{{ lane.name }}</div>

    <div class="pads-area">
      <div v-for="group in padGroups" :key="group[0]" class="pad-group">
        <PadButton
          v-for="i in group"
          :key="i"
          :active="pads[lane.id]?.[i]?.active ?? false"
          :is-current="currentStep === i"
          :note="pads[lane.id]?.[i]?.note ?? 'C3'"
          :has-notes="hasNotes"
          :color="color"
          @toggle="togglePad(lane.id, i)"
          @open-note-picker="openNotePicker(lane.id, i)"
        />
      </div>
    </div>

    <div class="lane-controls">
      <div class="control-group">
        <span class="ctrl-label">VOL</span>
        <v-slider
          v-model="laneSettings[lane.id].volume"
          min="0" max="100" step="1"
          hide-details density="compact"
          :color="color"
          class="ctrl-slider"
          thumb-size="10"
        />
      </div>
      <div class="control-group">
        <span class="ctrl-label">REV</span>
        <v-slider
          v-model="laneSettings[lane.id].reverbSend"
          min="0" max="100" step="1"
          hide-details density="compact"
          color="secondary"
          class="ctrl-slider"
          thumb-size="10"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import PadButton from './PadButton.vue'
import { useSequencer } from '../composables/useSequencer'
import { STEPS } from '../config/samples'

const props = defineProps({
  lane: { type: Object, required: true },
  hasNotes: Boolean,
  color: { type: String, default: '#ff6b2b' },
})

const { pads, laneSettings, currentStep, togglePad, openNotePicker } = useSequencer()

const dimColor = computed(() => props.color + '88')

// Split 16 steps into 4 groups of 4
const padGroups = computed(() => {
  const groups = []
  for (let g = 0; g < 4; g++) {
    const indices = []
    for (let i = 0; i < 4; i++) indices.push(g * 4 + i)
    groups.push(indices)
  }
  return groups
})
</script>

<style scoped>
.lane-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
}

.lane-name {
  width: 64px;
  flex-shrink: 0;
  font-family: 'Courier New', monospace;
  font-size: 10px;
  letter-spacing: 0.08em;
  text-align: right;
  text-transform: uppercase;
  padding-right: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pads-area {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.pad-group {
  display: flex;
  gap: 3px;
}

.lane-controls {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100px;
}

.ctrl-label {
  font-family: 'Courier New', monospace;
  font-size: 9px;
  letter-spacing: 0.1em;
  color: #3a5070;
  flex-shrink: 0;
  width: 22px;
}

.ctrl-slider {
  flex: 1;
}
</style>

<template>
  <div
    class="lane-row"
    role="group"
    :aria-label="`${lane.name} lane`"
    @mouseup="endDrag"
    @mouseleave="endDrag"
  >
    <div class="lane-name-cell">
      <select
        v-if="lane.options"
        class="lane-select"
        :value="laneSampleSelections[lane.id]"
        :aria-label="`Sample for ${lane.name}`"
        @change="setLaneSample(lane.id, $event.target.value)"
      >
        <option v-for="opt in lane.options" :key="opt.sample" :value="opt.sample">{{ opt.label }}</option>
      </select>
      <span v-else class="lane-name">{{ lane.name }}</span>
    </div>

    <div class="pads-area">
      <div v-for="(group, gi) in padGroups" :key="gi" class="pad-group">
        <PadButton
          v-for="(stepIdx, si) in group"
          :key="stepIdx"
          :active="pads[lane.id]?.[stepIdx]?.active ?? false"
          :is-current="currentStep === stepIdx"
          :color="color"
          :lane-name="lane.name"
          :step-num="stepIdx + 1"
          @mousedown.prevent="startDrag(lane.id, stepIdx)"
          @mouseenter="enterDrag(lane.id, stepIdx)"
          @click="handleClick(lane.id, stepIdx, $event)"
        />
      </div>
    </div>

    <div class="lane-controls">
      <div class="control-group">
        <v-slider
          v-model="laneSettings[lane.id].volume"
          min="0" max="100" step="1"
          hide-details density="compact"
          :color="color"
          class="ctrl-slider"
          thumb-size="12"
          :aria-label="`Volume for ${lane.name}`"
        />
        <span class="ctrl-label" aria-hidden="true">VOL</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onUnmounted } from 'vue'
import PadButton from './PadButton.vue'
import { useSequencer } from '../composables/useSequencer'

defineProps({
  lane:  { type: Object, required: true },
  color: { type: String, default: '#ff6b2b' },
})

const { pads, laneSettings, laneSampleSelections, currentStep, togglePad, setLaneSample } = useSequencer()

const padGroups = computed(() =>
  Array.from({ length: 4 }, (_, g) =>
    Array.from({ length: 4 }, (_, i) => g * 4 + i)
  )
)

// --- Drag-to-paint ---
const drag = ref({ active: false, mode: 'activate' })

function startDrag(laneId, stepIndex) {
  const pad = pads[laneId]?.[stepIndex]
  if (!pad) return
  const newState = !pad.active
  pad.active = newState
  drag.value = { active: true, mode: newState ? 'activate' : 'erase' }
}

function enterDrag(laneId, stepIndex) {
  if (!drag.value.active) return
  const pad = pads[laneId]?.[stepIndex]
  if (!pad) return
  pad.active = drag.value.mode === 'activate'
}

function endDrag() { drag.value.active = false }

// Keyboard-triggered clicks (Enter/Space) have event.detail === 0
function handleClick(laneId, stepIndex, event) {
  if (event.detail === 0) togglePad(laneId, stepIndex)
}

window.addEventListener('mouseup', endDrag)
onUnmounted(() => window.removeEventListener('mouseup', endDrag))
</script>

<style scoped>
.lane-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0;
}

.lane-name-cell {
  width: 110px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 12px;
}

.lane-name {
  font-family: 'Courier New', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-align: right;
  color: #7a9ab8;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lane-select {
  width: 100%;
  background: #0d1522;
  border: 1px solid #253550;
  border-radius: 2px;
  color: #7a9ab8;
  font-family: 'Courier New', monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 3px 4px;
  cursor: pointer;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5' viewBox='0 0 8 5'%3E%3Cpath fill='%235a7a9a' d='M0 0l4 5 4-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 5px center;
  padding-right: 18px;
}

.lane-select:hover {
  border-color: #3a5878;
  color: #9ab8d8;
}

.lane-select:focus {
  border-color: #ff6b2b;
}

.lane-select option {
  background: #0d1522;
  color: #7a9ab8;
}

.pads-area {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.pad-group {
  display: flex;
  gap: 4px;
}

.lane-controls {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  align-items: center;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 240px;
  flex-shrink: 0;
}

.ctrl-slider {
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
</style>

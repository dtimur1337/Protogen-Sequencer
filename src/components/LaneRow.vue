<template>
  <div
    class="lane-row"
    role="group"
    :aria-label="`${lane.name} lane`"
    @mouseup="endDrag"
    @mouseleave="endDrag"
  >
    <div class="lane-name" aria-hidden="true">{{ lane.name }}</div>

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

const { pads, laneSettings, currentStep, togglePad } = useSequencer()

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

.lane-name {
  width: 110px;
  flex-shrink: 0;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-align: right;
  color: #7a9ab8;
  padding-right: 12px;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

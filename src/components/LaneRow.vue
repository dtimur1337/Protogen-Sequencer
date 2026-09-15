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

    <div class="pads-scroll" ref="padScrollRef" @scroll.passive="onScroll">
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
    </div>

  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import PadButton from './PadButton.vue'
import { useSequencer } from '../composables/useSequencer'
import { useSyncScroll } from '../composables/useSyncScroll'

defineProps({
  lane:  { type: Object, required: true },
  color: { type: String, default: '#ff6b2b' },
})

const { pads, laneSampleSelections, currentStep, steps, togglePad, setLaneSample } = useSequencer()
const { register, unregister, onScroll } = useSyncScroll()
const padScrollRef = ref(null)
onMounted(() => register(padScrollRef.value))
onUnmounted(() => unregister(padScrollRef.value))

const padGroups = computed(() =>
  Array.from({ length: steps.value / 4 }, (_, g) =>
    Array.from({ length: 4 }, (_, i) => g * 4 + i)
  )
)

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
  width: 100%;
}

.pads-scroll {
  flex: 1;
  overflow-x: auto;
  scrollbar-width: none;
  min-width: 0;
}
.pads-scroll::-webkit-scrollbar { display: none; }

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
  color: var(--c-text-2);
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lane-select {
  width: 100%;
  background: var(--c-surf-lo);
  border: 1px solid var(--c-border-2);
  border-radius: 2px;
  color: var(--c-text-2);
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
  border-color: var(--c-border-3);
  color: var(--c-text-1);
}

.lane-select:focus {
  border-color: var(--c-accent);
}

.lane-select option {
  background: var(--c-surf-lo);
  color: var(--c-text-2);
}

.pads-area {
  display: flex;
  gap: 8px;
}

.pad-group {
  display: flex;
  gap: 4px;
}
</style>

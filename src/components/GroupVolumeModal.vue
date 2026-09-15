<template>
  <teleport to="body">
    <div class="modal-overlay" @click.self="close()">
      <div class="modal-card" :style="{ '--group-color': group.color }">
        <div class="modal-header">
          <span class="modal-title">{{ group.name.toUpperCase() }} — VOL &amp; REV</span>
          <button class="modal-close" @click="close()">✕</button>
        </div>
        <div class="modal-body">
          <div class="faders">
            <div class="fader">
              <span class="fader-val">{{ groupVolumes[group.id] }}</span>
              <v-slider
                v-model="groupVolumes[group.id]"
                direction="vertical" min="0" max="100" step="1"
                hide-details density="compact" thumb-size="12"
                :color="group.color" class="fader-slider"
              />
              <span class="fader-label">VOL</span>
            </div>
            <div class="fader">
              <span class="fader-val">{{ groupReverbSends[group.id] }}</span>
              <v-slider
                v-model="groupReverbSends[group.id]"
                direction="vertical" min="0" max="100" step="1"
                hide-details density="compact" thumb-size="12"
                color="#7a9ab8" class="fader-slider"
              />
              <span class="fader-label">REV</span>
            </div>
            <template v-if="!group.hasNotes">
              <div class="fader-divider" />
              <div v-for="lane in group.lanes" :key="lane.id" class="fader">
                <span class="fader-val">{{ laneSettings[lane.id]?.volume ?? 80 }}</span>
                <v-slider
                  v-model="laneSettings[lane.id].volume"
                  direction="vertical" min="0" max="100" step="1"
                  hide-details density="compact" thumb-size="12"
                  :color="group.color + '88'" class="fader-slider"
                />
                <span class="fader-label">{{ lane.name }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useSequencer } from '../composables/useSequencer'
import { useGroupModal } from '../composables/useGroupModal'
import { GROUPS } from '../config/samples'

const { groupVolumes, groupReverbSends, laneSettings } = useSequencer()
const { activeGroupId, close } = useGroupModal()

const group = computed(() => GROUPS.find(g => g.id === activeGroupId.value))
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: #00000088;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-card {
  background: #0d1420;
  border: 1px solid #1a2540;
  border-top: 2px solid var(--group-color);
  border-radius: 4px;
  max-width: 90vw;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px 10px;
  border-bottom: 1px solid #1a2540;
}

.modal-title {
  font-family: 'Courier New', monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: var(--group-color);
}

.modal-close {
  background: transparent;
  border: none;
  color: #5a7a9a;
  font-size: 14px;
  cursor: pointer;
  padding: 2px 6px;
  line-height: 1;
}
.modal-close:hover { color: #a8c8e0; }

.modal-body {
  padding: 24px 24px 32px;
  display: flex;
  justify-content: center;
}

.faders {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.fader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 42px;
}

.fader-slider {
  height: 100px;
}
.fader-slider :deep(.v-input__control),
.fader-slider :deep(.v-slider__container),
.fader-slider :deep(.v-slider-track) {
  height: 100px;
  min-height: unset;
}

.fader-val {
  font-family: 'Courier New', monospace;
  font-size: 9px;
  color: #7a9ab8;
  min-width: 24px;
  text-align: center;
}

.fader-label {
  font-family: 'Courier New', monospace;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #7a9ab8;
  text-transform: uppercase;
  white-space: nowrap;
}

.fader-divider {
  width: 1px;
  height: 100px;
  background: #1a2540;
  margin: 0 4px;
  align-self: center;
}
</style>

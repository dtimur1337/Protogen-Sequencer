<template>
  <teleport to="body">
    <div class="modal-overlay" @click.self="close()">
      <div class="modal-card">
        <div class="modal-header">
          <span class="modal-title">VOLUME &amp; REVERB</span>
          <button class="modal-close" @click="close()">✕</button>
        </div>

        <div class="modal-body">
          <!-- DRUMS -->
          <div class="mixer-section">
            <div class="section-label">DRUMS</div>
            <div class="faders">
              <div class="fader">
                <span class="fader-val">{{ groupVolumes.drums }}</span>
                <v-slider
                  v-model="groupVolumes.drums"
                  direction="vertical" min="0" max="100" step="1"
                  hide-details density="compact" thumb-size="12"
                  color="#ff6b2b" class="fader-slider"
                />
                <span class="fader-label">VOL</span>
              </div>
              <div class="fader">
                <span class="fader-val">{{ groupReverbSends.drums }}</span>
                <v-slider
                  v-model="groupReverbSends.drums"
                  direction="vertical" min="0" max="100" step="1"
                  hide-details density="compact" thumb-size="12"
                  color="#7a9ab8" class="fader-slider"
                />
                <span class="fader-label">REV</span>
              </div>
              <div class="fader-divider" />
              <div v-for="lane in drumsLanes" :key="lane.id" class="fader">
                <span class="fader-val">{{ laneSettings[lane.id]?.volume ?? 80 }}</span>
                <v-slider
                  v-model="laneSettings[lane.id].volume"
                  direction="vertical" min="0" max="100" step="1"
                  hide-details density="compact" thumb-size="12"
                  color="#ff6b2b88" class="fader-slider"
                />
                <span class="fader-label">{{ lane.name }}</span>
              </div>
            </div>
          </div>

          <div class="section-sep" />

          <!-- BASS -->
          <div class="mixer-section">
            <div class="section-label">BASS</div>
            <div class="faders">
              <div class="fader">
                <span class="fader-val">{{ groupVolumes.bass }}</span>
                <v-slider
                  v-model="groupVolumes.bass"
                  direction="vertical" min="0" max="100" step="1"
                  hide-details density="compact" thumb-size="12"
                  color="#1e90ff" class="fader-slider"
                />
                <span class="fader-label">VOL</span>
              </div>
              <div class="fader">
                <span class="fader-val">{{ groupReverbSends.bass }}</span>
                <v-slider
                  v-model="groupReverbSends.bass"
                  direction="vertical" min="0" max="100" step="1"
                  hide-details density="compact" thumb-size="12"
                  color="#7a9ab8" class="fader-slider"
                />
                <span class="fader-label">REV</span>
              </div>
            </div>
          </div>

          <div class="section-sep" />

          <!-- MELODICS -->
          <div class="mixer-section">
            <div class="section-label">MELODICS</div>
            <div class="faders">
              <div class="fader">
                <span class="fader-val">{{ groupVolumes.melodics }}</span>
                <v-slider
                  v-model="groupVolumes.melodics"
                  direction="vertical" min="0" max="100" step="1"
                  hide-details density="compact" thumb-size="12"
                  color="#00d4ff" class="fader-slider"
                />
                <span class="fader-label">VOL</span>
              </div>
              <div class="fader">
                <span class="fader-val">{{ groupReverbSends.melodics }}</span>
                <v-slider
                  v-model="groupReverbSends.melodics"
                  direction="vertical" min="0" max="100" step="1"
                  hide-details density="compact" thumb-size="12"
                  color="#7a9ab8" class="fader-slider"
                />
                <span class="fader-label">REV</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { useSequencer } from '../composables/useSequencer'
import { useVolumeModal } from '../composables/useVolumeModal'
import { GROUPS } from '../config/samples'

const { groupVolumes, groupReverbSends, laneSettings } = useSequencer()
const { close } = useVolumeModal()

const drumsLanes = GROUPS.find(g => g.id === 'drums')?.lanes ?? []
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
  border-radius: 4px;
  min-width: 480px;
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
  color: #ff6b2b;
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
  display: flex;
  align-items: flex-start;
  gap: 0;
  padding: 24px 24px 32px;
}

.section-sep {
  width: 1px;
  background: #1a2540;
  align-self: stretch;
  margin: 0 20px;
}

.mixer-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-label {
  font-family: 'Courier New', monospace;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: #5a7a9a;
  text-align: center;
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

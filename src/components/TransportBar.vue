<template>
  <div class="transport">
    <button
      class="play-btn"
      :class="{ playing: isPlaying }"
      :disabled="isLoading"
      @click="isPlaying ? stop() : play()"
    >
      <v-icon size="20">{{ isPlaying ? 'mdi-stop' : 'mdi-play' }}</v-icon>
      <span class="play-label">{{ isLoading ? 'LOADING…' : isPlaying ? 'STOP' : 'PLAY' }}</span>
    </button>

    <div class="bpm-control">
      <span class="transport-label">BPM</span>
      <v-slider
        v-model="bpm"
        min="60" max="180" step="1"
        hide-details density="compact"
        color="primary"
        class="bpm-slider"
        thumb-size="12"
        aria-label="Tempo in BPM"
      />
    </div>
    <span class="bpm-value">{{ bpm }}</span>

    <div class="vol-control">
      <span class="transport-label">VOL</span>
      <v-slider
        v-model="masterVolume"
        min="0" max="100" step="1"
        hide-details density="compact"
        color="secondary"
        class="vol-slider"
        thumb-size="12"
        aria-label="Master volume"
      />
    </div>

    <div class="steps-toggle">
      <button
        v-for="n in [16, 32]"
        :key="n"
        class="steps-btn"
        :class="{ active: steps === n }"
        @click="setSteps(n)"
      >{{ n }}</button>
    </div>

    <div class="step-indicators">
      <div
        v-for="i in steps"
        :key="i"
        class="step-dot"
        :class="{ active: currentStep === i - 1, small: steps === 32 }"
      />
    </div>
  </div>
</template>

<script setup>
import { useSequencer } from '../composables/useSequencer'

const { isPlaying, isLoading, currentStep, bpm, masterVolume, steps, play, stop, setSteps } = useSequencer()
</script>

<style scoped>
.transport {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 12px 16px;
  background: #0d1420;
  border-bottom: 1px solid #1a2540;
}

.play-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #ff6b2b;
  border-radius: 3px;
  color: #ff6b2b;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  letter-spacing: 0.15em;
  cursor: pointer;
  transition: background 0.1s, box-shadow 0.1s;
  flex-shrink: 0;
}

.play-btn:hover:not(:disabled) {
  background: #ff6b2b18;
  box-shadow: 0 0 10px #ff6b2b44;
}

.play-btn.playing {
  border-color: #ff4444;
  color: #ff4444;
}

.play-btn.playing:hover {
  background: #ff444418;
  box-shadow: 0 0 10px #ff444444;
}

.play-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.play-label {
  font-weight: 700;
}

.bpm-control {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 240px;
  flex-shrink: 0;
}

.vol-control {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 240px;
  flex-shrink: 0;
}

.vol-slider {
  flex: 1;
}

.transport-label {
  font-family: 'Courier New', monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  font-weight: 600;
  color: #8ab4d8;
  flex-shrink: 0;
  width: 28px;
}

.bpm-slider {
  flex: 1;
}

.bpm-value {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  font-weight: 700;
  color: #ff6b2b;
  width: 30px;
  text-align: right;
  flex-shrink: 0;
}

.steps-toggle {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.steps-btn {
  font-family: 'Courier New', monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 3px 8px;
  background: transparent;
  border: 1px solid #253550;
  border-radius: 2px;
  color: #5a7a9a;
  cursor: pointer;
  transition: background 0.1s, border-color 0.1s, color 0.1s;
}

.steps-btn:hover {
  border-color: #3a5878;
  color: #8ab4d8;
}

.steps-btn.active {
  border-color: #ff6b2b;
  background: #ff6b2b18;
  color: #ff6b2b;
}

.step-indicators {
  display: flex;
  gap: 3px;
  align-items: center;
  flex-wrap: nowrap;
}

.step-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #1a2540;
  transition: background 0.05s;
  flex-shrink: 0;
}

.step-dot.small {
  width: 4px;
  height: 4px;
}

.step-dot:nth-child(4n+1) {
  background: #1e3050;
}

.step-dot.active {
  background: #ff6b2b;
  box-shadow: 0 0 6px #ff6b2b88;
}
</style>

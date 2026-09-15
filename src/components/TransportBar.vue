<template>
  <div class="transport">
    <button
      class="play-btn"
      :class="{ playing: isPlaying }"
      :disabled="isLoading"
      @click="isPlaying ? stop() : play()"
    >
      <v-icon size="20">{{ isPlaying ? 'mdi-stop' : 'mdi-play' }}</v-icon>
      <span class="play-label" aria-hidden="true">{{ isLoading ? 'LOADING…' : isPlaying ? 'STOP' : 'PLAY' }}</span>
    </button>

    <button class="mixer-btn" @click="openMixer" aria-label="Mixer">
      <v-icon size="18">mdi-tune</v-icon>
      <span class="mixer-label">MIXER</span>
    </button>

    <div class="transport-frame">
      <span class="transport-label">BPM</span>
      <input
        v-model.number="bpm"
        type="number"
        min="60" max="300" step="1"
        class="bpm-input"
        aria-label="Tempo in BPM"
        @change="bpm = Math.min(300, Math.max(60, bpm))"
      />
    </div>

    <div class="transport-frame">
      <span class="transport-label">STEPS</span>
      <div class="steps-toggle">
        <button
          v-for="n in [16, 32, 64]"
          :key="n"
          class="steps-btn"
          :class="{ active: steps === n }"
          @click="setSteps(n)"
        >{{ n }}</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { useSequencer } from '../composables/useSequencer'
import { useVolumeModal } from '../composables/useVolumeModal'

const { isPlaying, isLoading, bpm, steps, play, stop, setSteps } = useSequencer()
const { open: openMixer } = useVolumeModal()
</script>

<style scoped>
.transport {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--c-surf);
  border-bottom: 1px solid var(--c-border);
  position: sticky;
  top: var(--v-layout-top, 0px);
  z-index: 10;
}

.play-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 48px;
  padding: 0 16px;
  background: var(--c-accent);
  border: 1px solid var(--c-accent);
  border-radius: 3px;
  color: #fff;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  letter-spacing: 0.15em;
  cursor: pointer;
  transition: background 0.1s, box-shadow 0.1s;
  flex-shrink: 0;
}

.play-btn:hover:not(:disabled) {
  background: var(--c-accent-dim);
  box-shadow: 0 0 10px var(--c-accent-glow);
}

.play-btn.playing {
  background: var(--c-stop);
  border-color: var(--c-stop);
  color: #fff;
}

.play-btn.playing:hover {
  background: color-mix(in srgb, var(--c-stop) 85%, black);
  box-shadow: 0 0 10px color-mix(in srgb, var(--c-stop) 30%, transparent);
}

.play-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.play-label {
  font-weight: 700;
}

.mixer-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.15em;
  padding: 0 14px;
  height: 48px;
  background: transparent;
  border: 1px solid var(--c-border-2);
  border-radius: 3px;
  color: var(--c-text-2);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.1s, border-color 0.1s, color 0.1s;
}
.mixer-btn:hover {
  border-color: var(--c-border-3);
  color: var(--c-text-1);
  background: var(--c-pad);
}

.transport-frame {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 8px;
  border: 1px solid var(--c-border-2);
  border-radius: 3px;
  flex-shrink: 0;
  box-sizing: border-box;
}

.transport-label {
  font-family: 'Courier New', monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  font-weight: 600;
  color: var(--c-text-2);
  flex-shrink: 0;
}

.bpm-input {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  font-weight: 700;
  color: var(--c-accent);
  background: var(--c-surf-lo);
  border: 1px solid var(--c-border-2);
  border-radius: 2px;
  width: 56px;
  padding: 3px 6px;
  text-align: center;
  outline: none;
  -moz-appearance: textfield;
}
.bpm-input::-webkit-outer-spin-button,
.bpm-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.bpm-input:focus { border-color: var(--c-accent); }

.steps-toggle {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  align-self: stretch;
  align-items: stretch;
}

.steps-btn {
  font-family: 'Courier New', monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 0 8px;
  background: transparent;
  border: 1px solid var(--c-border-2);
  border-radius: 2px;
  color: var(--c-text-2);
  cursor: pointer;
  transition: background 0.1s, border-color 0.1s, color 0.1s;
}

.steps-btn:hover {
  border-color: var(--c-border-3);
  color: var(--c-text-1);
}

.steps-btn.active {
  border-color: var(--c-accent);
  background: var(--c-accent-bg);
  color: var(--c-accent);
}

@media (max-width: 599px) {
  .transport { gap: 8px; padding: 10px 12px; flex-wrap: nowrap; }
  .play-label { display: none; }
  .play-btn { padding: 0; width: 48px; justify-content: center; flex-shrink: 0; }
  .mixer-label { display: none; }
  .mixer-btn { padding: 0; width: 44px; justify-content: center; flex-shrink: 0; }
  .steps-btn { padding: 0 5px; }
  .transport-frame { padding: 6px; flex: 1; justify-content: center; }
  .transport-label { font-size: 9px; }
}
</style>

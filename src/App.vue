<template>
  <v-app theme="sequencerTheme">
    <v-app-bar flat color="#080c16" border="b" :border-color="'#1a2540'">
      <v-app-bar-title>
        <span class="app-title">PROTOGEN SEQUENCER</span>
      </v-app-bar-title>
      <template #append>
        <div class="header-actions">
          <button class="header-btn" @click="resetTrack">NEW TRACK</button>
          <button class="header-btn header-btn--accent" @click="handleLoadDemo">DEMO TRACK</button>
        </div>
      </template>
    </v-app-bar>

    <v-main style="background: #0a0e1a;">
      <TransportBar />
      <v-container fluid class="pa-4 pa-md-6">
        <SequencerGrid />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import TransportBar from './components/TransportBar.vue'
import SequencerGrid from './components/SequencerGrid.vue'
import { useSequencer } from './composables/useSequencer'
import demoPreset from './presets/demo.json'

const { resetTrack, loadPreset } = useSequencer()

function handleLoadDemo() {
  loadPreset(demoPreset)
}
</script>

<style scoped>
.app-title {
  font-family: 'Courier New', Courier, monospace;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.25em;
  color: #ff6b2b;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 16px;
}

.header-btn {
  font-family: 'Courier New', monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.15em;
  padding: 6px 14px;
  background: transparent;
  border: 1px solid #253550;
  border-radius: 2px;
  color: #5a7a9a;
  cursor: pointer;
  transition: background 0.1s, border-color 0.1s, color 0.1s;
}

.header-btn:hover {
  border-color: #3a5878;
  color: #8ab4d8;
  background: #0d1a2a;
}

.header-btn--accent {
  border-color: #ff6b2b55;
  color: #ff6b2b99;
}

.header-btn--accent:hover {
  border-color: #ff6b2b;
  color: #ff6b2b;
  background: #ff6b2b12;
}
</style>

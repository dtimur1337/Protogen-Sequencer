<template>
  <v-app theme="sequencerTheme">
    <v-app-bar flat color="#080c16" border="b" :border-color="'#1a2540'">
      <v-app-bar-title>
        <span class="app-title">PROTOGEN SEQUENCER</span>
      </v-app-bar-title>
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
</script>

<style scoped>
.app-title {
  font-family: 'Courier New', Courier, monospace;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.25em;
  color: #ff6b2b;
}
</style>

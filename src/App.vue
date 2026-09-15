<template>
  <v-app theme="sequencerTheme">
    <v-app-bar flat color="#080c16" border="b" :border-color="'#1a2540'">
      <v-app-bar-title>
        <h1 class="app-title">PROTOGEN SEQUENCER</h1>
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
      <v-container fluid class="pa-4 pa-md-6" style="padding-bottom: 34px;">
        <SequencerGrid />
      </v-container>
      <div class="sticky-scrollbar" ref="scrollBarRef" @scroll.passive="onScroll">
        <div class="sticky-scrollbar-inner" :style="{ width: stickyInnerWidth + 'px' }" />
      </div>
    </v-main>
    <VolumeReverbModal v-if="showModal" />
    <GroupVolumeModal v-if="activeGroupId" />
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import TransportBar from './components/TransportBar.vue'
import SequencerGrid from './components/SequencerGrid.vue'
import VolumeReverbModal from './components/VolumeReverbModal.vue'
import GroupVolumeModal from './components/GroupVolumeModal.vue'
import { useSequencer } from './composables/useSequencer'
import { useSyncScroll } from './composables/useSyncScroll'
import { useVolumeModal } from './composables/useVolumeModal'
import { useGroupModal } from './composables/useGroupModal'
import demoPreset from './presets/demo.json'

const { resetTrack, loadPreset, steps } = useSequencer()
const { register, unregister, onScroll } = useSyncScroll()
const { show: showModal } = useVolumeModal()
const { activeGroupId } = useGroupModal()

function handleLoadDemo() { loadPreset(demoPreset) }

const scrollBarRef = ref(null)

// Same geometry as PianoRollGroup / LaneRow pad groups
const PAD_W = 36, GAP_IN = 4, GAP_OUT = 8
// 186px = fixed left offset (container padding 24 + group-panel padding 14 + border 2 + lane-name 110 + gap 12 + container right padding 24)
// Adding this aligns the scrollbar's max-scroll with the pads-scroll max-scroll
const SCROLL_LEFT_OFFSET = 186
const stickyInnerWidth = computed(() => {
  const n = steps.value / 4
  return n * (4 * PAD_W + 3 * GAP_IN) + (n - 1) * GAP_OUT + SCROLL_LEFT_OFFSET
})

onMounted(() => register(scrollBarRef.value))
onUnmounted(() => unregister(scrollBarRef.value))
</script>

<style scoped>
.sticky-scrollbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  overflow-x: auto;
  overflow-y: hidden;
  height: 20px;
  background: #0d1420;
  border-top: 1px solid #1a2540;
  z-index: 9;
}

.sticky-scrollbar::-webkit-scrollbar {
  height: 20px;
}
.sticky-scrollbar::-webkit-scrollbar-track {
  background: #0d1420;
}
.sticky-scrollbar::-webkit-scrollbar-thumb {
  background: #2a4060;
  border-radius: 10px;
  border: 7px solid #0d1420;
  background-clip: padding-box;
}
.sticky-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #3a5878;
  background-clip: padding-box;
}

.sticky-scrollbar-inner {
  height: 1px;
}

.app-title {
  font-family: 'Courier New', Courier, monospace;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.25em;
  color: #ff6b2b;
  margin: 0;
  line-height: 1;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 16px;
}

.header-btn {
  font-family: 'Courier New', monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.15em;
  padding: 6px 14px;
  background: transparent;
  border: 1px solid #253550;
  border-radius: 2px;
  color: #7a9ab8;
  cursor: pointer;
  transition: background 0.1s, border-color 0.1s, color 0.1s;
}

.header-btn:hover {
  border-color: #3a5878;
  color: #a8c8e0;
  background: #0d1a2a;
}

.header-btn--accent {
  border-color: #d0602880;
  color: #d06028;
}

.header-btn--accent:hover {
  border-color: #ff6b2b;
  color: #ff6b2b;
  background: #ff6b2b12;
}
</style>

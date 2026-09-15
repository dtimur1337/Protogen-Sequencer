<template>
  <v-app :theme="currentVuetifyTheme">
    <v-app-bar flat color="surface" border="b">
      <v-app-bar-title>
        <h1 class="app-title">PROTOGEN SEQUENCER</h1>
      </v-app-bar-title>
      <template #append>
        <div class="header-actions">
          <button class="header-btn" @click="resetTrack">NEW TRACK</button>
          <button class="header-btn" @click="openProject">OPEN</button>
          <button class="header-btn" @click="saveProject">SAVE</button>
          <button class="header-btn header-btn--accent" @click="handleLoadDemo">DEMO TRACK</button>
          <button class="theme-toggle" :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'" @click="toggleTheme">
            <v-icon size="18">{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
          </button>
        </div>
        <div class="burger-wrap" ref="burgerWrapRef">
          <button class="burger-btn" aria-label="Open menu" @click="menuOpen = !menuOpen">
            <v-icon size="22">mdi-menu</v-icon>
          </button>
          <div v-if="menuOpen" class="burger-dropdown">
            <button class="burger-item" @click="menuOpen = false; resetTrack()">NEW TRACK</button>
            <button class="burger-item" @click="menuOpen = false; openProject()">OPEN</button>
            <button class="burger-item" @click="menuOpen = false; saveProject()">SAVE</button>
            <button class="burger-item burger-item--accent" @click="menuOpen = false; handleLoadDemo()">DEMO TRACK</button>
            <div class="burger-sep" />
            <button class="burger-item" @click="menuOpen = false; toggleTheme()">
              <v-icon size="14">{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
              {{ isDark ? 'LIGHT MODE' : 'DARK MODE' }}
            </button>
          </div>
        </div>
      </template>
    </v-app-bar>

    <v-main :style="{ background: 'var(--c-bg)' }">
      <TransportBar />
      <v-container fluid class="px-0 px-md-6 py-4 py-md-6" style="padding-bottom: 34px;">
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
import { useTheme } from './composables/useTheme'
import { saveProject, openProject, tryRestoreAutosave } from './composables/useProjectFile'
import demoPreset from './presets/demo.json'

const { resetTrack, loadPreset, setSteps, steps } = useSequencer()
const { register, unregister, onScroll } = useSyncScroll()
const { show: showModal } = useVolumeModal()
const { activeGroupId } = useGroupModal()
const { isDark, vuetifyTheme: currentVuetifyTheme, toggle: toggleTheme } = useTheme()

function handleLoadDemo() {
  if (demoPreset.steps) setSteps(demoPreset.steps)
  loadPreset(demoPreset)
}

const scrollBarRef = ref(null)
const burgerWrapRef = ref(null)
const menuOpen = ref(false)

function onClickOutside(e) {
  if (burgerWrapRef.value && !burgerWrapRef.value.contains(e.target)) menuOpen.value = false
}

const PAD_W = 36, GAP_IN = 4, GAP_OUT = 8
const SCROLL_LEFT_OFFSET = 186
const stickyInnerWidth = computed(() => {
  const n = steps.value / 4
  return n * (4 * PAD_W + 3 * GAP_IN) + (n - 1) * GAP_OUT + SCROLL_LEFT_OFFSET
})

onMounted(() => {
  register(scrollBarRef.value)
  tryRestoreAutosave()
  document.addEventListener('click', onClickOutside, true)
})
onUnmounted(() => {
  unregister(scrollBarRef.value)
  document.removeEventListener('click', onClickOutside, true)
})
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
  background: var(--c-surf);
  border-top: 1px solid var(--c-border);
  z-index: 9;
}

.sticky-scrollbar::-webkit-scrollbar {
  height: 20px;
}
.sticky-scrollbar::-webkit-scrollbar-track {
  background: var(--c-surf);
}
.sticky-scrollbar::-webkit-scrollbar-thumb {
  background: var(--c-border-5);
  border-radius: 10px;
  border: 7px solid var(--c-surf);
  background-clip: padding-box;
}
.sticky-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--c-border-3);
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
  color: var(--c-accent);
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
  border: 1px solid var(--c-border-2);
  border-radius: 2px;
  color: var(--c-text-2);
  cursor: pointer;
  transition: background 0.1s, border-color 0.1s, color 0.1s;
}

.header-btn:hover {
  border-color: var(--c-border-3);
  color: var(--c-text-1);
  background: var(--c-pad);
}

.header-btn--accent {
  border-color: var(--c-accent-dim);
  color: var(--c-accent-dim);
}

.header-btn--accent:hover {
  border-color: var(--c-accent);
  color: var(--c-accent);
  background: var(--c-accent-bg);
}

.burger-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: transparent;
  border: 1px solid var(--c-border-2);
  border-radius: 50%;
  color: var(--c-text-2);
  cursor: pointer;
  margin-right: 12px;
  flex-shrink: 0;
  transition: background 0.1s, border-color 0.1s, color 0.1s;
}
.burger-btn:hover {
  border-color: var(--c-accent);
  color: var(--c-accent);
  background: var(--c-accent-bg);
}

.burger-wrap {
  position: relative;
}

.burger-dropdown {
  position: fixed;
  top: 52px;
  right: 8px;
  background: var(--c-surf);
  border: 1px solid var(--c-border);
  border-radius: 4px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 160px;
  z-index: 1000;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
}

.burger-item {
  font-family: 'Courier New', monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  padding: 9px 12px;
  background: transparent;
  border: none;
  border-radius: 2px;
  color: var(--c-text-2);
  cursor: pointer;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.1s, color 0.1s;
  width: 100%;
}
.burger-item:hover { background: var(--c-pad); color: var(--c-text-1); }
.burger-item--accent { color: var(--c-accent-dim); }
.burger-item--accent:hover { color: var(--c-accent); }

.burger-sep {
  height: 1px;
  background: var(--c-border);
  margin: 4px 0;
}

@media (max-width: 599px) {
  .header-actions { display: none; }
  .burger-btn { display: flex; }
  .app-title { font-size: 0.8rem; letter-spacing: 0.15em; }
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid var(--c-border-2);
  border-radius: 50%;
  color: var(--c-text-2);
  cursor: pointer;
  transition: background 0.1s, border-color 0.1s, color 0.1s;
  flex-shrink: 0;
}

.theme-toggle:hover {
  border-color: var(--c-accent);
  color: var(--c-accent);
  background: var(--c-accent-bg);
}
</style>

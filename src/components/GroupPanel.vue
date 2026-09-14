<template>
  <div class="group-panel" :style="{ '--group-color': group.color }">
    <!-- Header: just chevron + name + divider -->
    <button
      class="group-header"
      :aria-expanded="expanded"
      :aria-label="`${group.name} group, ${expanded ? 'collapse' : 'expand'}`"
      @click="expanded = !expanded"
    >
      <v-icon class="chevron" :class="{ 'chevron--collapsed': !expanded }" size="14">
        mdi-chevron-down
      </v-icon>
      <span class="group-name">{{ group.name }}</span>
      <div class="group-divider" />
    </button>

    <v-expand-transition>
      <div v-if="expanded" class="group-content">
        <!-- Group-level VOL + REV controls for non-pitched groups (Drums, FX) -->
        <div v-if="!group.hasNotes" class="group-controls">
          <div class="ctrl-row">
            <span class="ctrl-label">VOL</span>
            <v-slider
              v-model="groupVolumes[group.id]"
              min="0" max="100" step="1"
              hide-details density="compact"
              :color="group.color"
              class="ctrl-slider"
              thumb-size="12"
              :aria-label="`${group.name} volume`"
            />
          </div>
          <div class="ctrl-row">
            <span class="ctrl-label">REV</span>
            <v-slider
              v-model="groupReverbSends[group.id]"
              min="0" max="100" step="1"
              hide-details density="compact"
              color="secondary"
              class="ctrl-slider"
              thumb-size="12"
              :aria-label="`${group.name} reverb`"
            />
          </div>
        </div>

        <slot />
      </div>
    </v-expand-transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSequencer } from '../composables/useSequencer'

defineProps({ group: { type: Object, required: true } })
const expanded = ref(true)
const { groupVolumes, groupReverbSends } = useSequencer()
</script>

<style scoped>
.group-panel {
  border-left: 2px solid var(--group-color);
  padding-left: 14px;
  margin-bottom: 14px;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 0;
  text-align: left;
}

.group-header:hover .group-name {
  opacity: 0.85;
}

.chevron {
  color: var(--group-color);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.chevron--collapsed {
  transform: rotate(-90deg);
}

.group-name {
  font-family: 'Courier New', monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--group-color);
  flex-shrink: 0;
  transition: opacity 0.15s;
}

.group-divider {
  flex: 1;
  height: 1px;
  background: color-mix(in srgb, var(--group-color) 20%, transparent);
}

.group-content {
  padding-bottom: 4px;
}

/* Group-level controls for non-pitched groups — styled as transport bar */
.group-controls {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 8px 16px;
  background: #0d1420;
  border-top: 1px solid #1a2540;
  border-bottom: 1px solid #1a2540;
  margin: 6px 0 10px -14px;
}

.ctrl-row {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 240px;
  flex-shrink: 0;
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

.ctrl-slider {
  flex: 1;
}
</style>

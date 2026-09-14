<template>
  <div class="group-panel" :style="{ '--group-color': group.color }">
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
        <slot />
      </div>
    </v-expand-transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
defineProps({ group: { type: Object, required: true } })
const expanded = ref(true)
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
</style>

<template>
  <div class="group-panel" :style="{ '--group-color': group.color }">
    <div class="group-header">
      <span class="group-name">{{ group.name }}</span>
      <div class="group-divider" />
    </div>
    <div class="group-lanes">
      <LaneRow
        v-for="lane in group.lanes"
        :key="lane.id"
        :lane="lane"
        :has-notes="group.hasNotes"
        :color="group.color"
      />
    </div>
  </div>
</template>

<script setup>
import LaneRow from './LaneRow.vue'

defineProps({
  group: { type: Object, required: true },
})
</script>

<style scoped>
.group-panel {
  border-left: 2px solid var(--group-color);
  padding-left: 12px;
  margin-bottom: 12px;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.group-name {
  font-family: 'Courier New', monospace;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--group-color);
  flex-shrink: 0;
}

.group-divider {
  flex: 1;
  height: 1px;
  background: color-mix(in srgb, var(--group-color) 20%, transparent);
}

.group-lanes {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
</style>

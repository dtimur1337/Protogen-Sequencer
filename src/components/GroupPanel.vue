<template>
  <div class="group-panel" :style="{ '--group-color': group.color }">
    <!-- Header: just chevron + name + divider -->
    <div class="group-header">
      <button
        class="group-toggle"
        :aria-expanded="expanded"
        :aria-label="`${group.name} group, ${expanded ? 'collapse' : 'expand'}`"
        @click="expanded = !expanded"
      >
        <v-icon class="chevron" :class="{ 'chevron--collapsed': !expanded }" size="14">
          mdi-chevron-down
        </v-icon>
        <span class="group-name">{{ group.name }}</span>
      </button>
      <div class="group-divider" />
      <div class="group-ms">
        <button class="ms-btn ms-btn--vol" :aria-label="`Volume for ${group.name}`" @click="openGroupModal(group.id)">VOL &amp; REV</button>
        <button
          class="ms-btn ms-btn--mute"
          :class="{ active: groupMutes[group.id] }"
          :aria-label="`Mute ${group.name}`"
          @click="toggleMute(group.id)"
        >M</button>
        <button
          class="ms-btn ms-btn--solo"
          :class="{ active: groupSolos[group.id] }"
          :aria-label="`Solo ${group.name}`"
          @click="toggleSolo(group.id)"
        >S</button>
      </div>
    </div>

    <v-expand-transition>
      <div v-if="expanded" class="group-content">
        <slot />
      </div>
    </v-expand-transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSequencer } from '../composables/useSequencer'
import { useGroupModal } from '../composables/useGroupModal'

const props = defineProps({ group: { type: Object, required: true } })
const expanded = ref(true)
const { groupMutes, groupSolos, toggleMute, toggleSolo } = useSequencer()
const { open: openGroupModal } = useGroupModal()
</script>

<style scoped>
.group-panel {
  border-left: 2px solid var(--group-color);
  padding-left: 14px;
  margin-bottom: 20px;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 4px 0;
}

.group-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 0;
  flex-shrink: 0;
}

.group-toggle:hover .group-name {
  opacity: 0.85;
}

.group-ms {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  padding-right: 4px;
}

.ms-btn {
  font-family: 'Courier New', monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  width: 24px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  cursor: pointer;
  transition: background 0.1s, border-color 0.1s, color 0.1s;
}

.ms-btn--vol {
  background: transparent;
  border: 1px solid #3a4560;
  color: #7a9ab8;
  width: auto;
  padding: 0 6px;
  letter-spacing: 0.05em;
}
.ms-btn--vol:hover { border-color: #ff6b2b; color: #ff6b2b; }

.ms-btn--mute {
  background: transparent;
  border: 1px solid #3a4560;
  color: #7a9ab8;
}
.ms-btn--mute:hover  { border-color: #ff8844; color: #ff8844; }
.ms-btn--mute.active { background: #ff884422; border-color: #ff8844; color: #ff8844; }

.ms-btn--solo {
  background: transparent;
  border: 1px solid #3a4560;
  color: #7a9ab8;
}
.ms-btn--solo:hover  { border-color: #ffcc00; color: #ffcc00; }
.ms-btn--solo.active { background: #ffcc0022; border-color: #ffcc00; color: #ffcc00; }

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

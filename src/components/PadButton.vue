<template>
  <button
    class="pad"
    :class="{
      'pad--active': active,
      'pad--current': isCurrent,
      'pad--active-current': active && isCurrent,
    }"
    :style="{
      '--pad-color': color,
    }"
    @click="$emit('toggle')"
    @contextmenu.prevent="hasNotes && $emit('open-note-picker')"
  >
    <span v-if="hasNotes && active" class="pad__note">{{ note }}</span>
  </button>
</template>

<script setup>
defineProps({
  active: Boolean,
  isCurrent: Boolean,
  note: { type: String, default: 'C3' },
  hasNotes: Boolean,
  color: { type: String, default: '#ff6b2b' },
})
defineEmits(['toggle', 'open-note-picker'])
</script>

<style scoped>
.pad {
  width: 30px;
  height: 30px;
  border: 1px solid #1e2d45;
  border-radius: 3px;
  background: #0d1522;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.05s, border-color 0.05s, box-shadow 0.05s;
  padding: 0;
  flex-shrink: 0;
}

.pad:hover {
  border-color: var(--pad-color);
  background: #141f2e;
}

.pad--current {
  border-color: #ffffff22;
  background: #131e30;
}

.pad--active {
  background: color-mix(in srgb, var(--pad-color) 25%, #0d1522);
  border-color: var(--pad-color);
  box-shadow: 0 0 6px color-mix(in srgb, var(--pad-color) 40%, transparent);
}

.pad--active-current {
  background: color-mix(in srgb, var(--pad-color) 50%, #0d1522);
  box-shadow: 0 0 12px color-mix(in srgb, var(--pad-color) 70%, transparent);
}

.pad__note {
  font-size: 7px;
  font-family: 'Courier New', monospace;
  color: #fff;
  letter-spacing: -0.02em;
  pointer-events: none;
  line-height: 1;
}
</style>

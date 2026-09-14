<template>
  <button
    class="pad"
    :class="{
      'pad--active': active,
      'pad--current': isCurrent,
      'pad--active-current': active && isCurrent,
    }"
    :style="{ '--pad-color': color }"
    :aria-label="ariaLabel"
    :aria-pressed="active"
    @click="$emit('toggle')"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  active:    Boolean,
  isCurrent: Boolean,
  color:     { type: String, default: '#ff6b2b' },
  laneName:  { type: String, default: '' },
  stepNum:   { type: Number, default: 1 },
})
defineEmits(['toggle'])

const ariaLabel = computed(() =>
  `${props.laneName} step ${props.stepNum}, ${props.active ? 'on' : 'off'}`
)
</script>

<style scoped>
.pad {
  width: 36px;
  height: 36px;
  border: 1px solid #1e2d45;
  border-radius: 3px;
  background: #0d1522;
  cursor: pointer;
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
  background: color-mix(in srgb, var(--pad-color) 28%, #0d1522);
  border-color: var(--pad-color);
  box-shadow: 0 0 6px color-mix(in srgb, var(--pad-color) 40%, transparent);
}

.pad--active-current {
  background: color-mix(in srgb, var(--pad-color) 55%, #0d1522);
  box-shadow: 0 0 14px color-mix(in srgb, var(--pad-color) 70%, transparent);
}
</style>

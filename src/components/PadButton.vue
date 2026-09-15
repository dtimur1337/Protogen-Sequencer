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
  border: 1px solid var(--c-border-2);
  border-radius: 3px;
  background: var(--c-pad);
  cursor: pointer;
  transition: background 0.05s, border-color 0.05s, box-shadow 0.05s;
  padding: 0;
  flex-shrink: 0;
}

.pad:hover {
  border-color: var(--pad-color);
  background: var(--c-pad-hover);
}

.pad--current {
  border-color: color-mix(in srgb, var(--c-text-1) 20%, transparent);
  background: var(--c-pad-cur);
}

.pad--active {
  background: color-mix(in srgb, var(--pad-color) 35%, var(--c-surf-lo));
  border-color: var(--pad-color);
  box-shadow: 0 0 8px color-mix(in srgb, var(--pad-color) 50%, transparent);
}

.pad--active-current {
  background: color-mix(in srgb, var(--pad-color) 60%, var(--c-surf-lo));
  box-shadow: 0 0 16px color-mix(in srgb, var(--pad-color) 75%, transparent);
}
</style>

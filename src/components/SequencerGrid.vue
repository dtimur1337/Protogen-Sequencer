<template>
  <div class="sequencer-grid">
    <GroupPanel v-for="group in GROUPS" :key="group.id" :group="group" />
  </div>
</template>

<script setup>
import GroupPanel from './GroupPanel.vue'
import { GROUPS } from '../config/samples'
</script>

<style scoped>
.sequencer-grid {
  overflow-x: auto;
  padding: 8px 0;
}
</style>

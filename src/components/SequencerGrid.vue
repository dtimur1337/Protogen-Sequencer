<template>
  <div class="sequencer-grid">
    <GroupPanel v-for="group in GROUPS" :key="group.id" :group="group">
      <!-- Piano roll for pitched groups (Bass, Melodics) -->
      <PianoRollGroup v-if="group.hasNotes" :group="group" />

      <!-- Lane rows for non-pitched groups (Drums, FX) -->
      <template v-else>
        <LaneRow
          v-for="lane in group.lanes"
          :key="lane.id"
          :lane="lane"
          :color="group.color"
        />
      </template>
    </GroupPanel>
  </div>
</template>

<script setup>
import GroupPanel from './GroupPanel.vue'
import LaneRow from './LaneRow.vue'
import PianoRollGroup from './PianoRollGroup.vue'
import { GROUPS } from '../config/samples'
</script>

<style scoped>
.sequencer-grid {
  overflow-x: auto;
  padding: 8px 0;
}
</style>

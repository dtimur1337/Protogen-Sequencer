<template>
  <v-app theme="sequencerTheme">
    <v-app-bar flat color="surface" border="b">
      <v-app-bar-title>
        <span class="app-title">PROTOGEN SEQUENCER</span>
      </v-app-bar-title>
    </v-app-bar>

    <v-main>
      <v-container fluid class="pa-4">
        <p style="color: #1e90ff; font-family: monospace;">Scaffolding ready. Let's build.</p>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
</script>

<style scoped>
.app-title {
  font-family: 'Courier New', Courier, monospace;
  font-weight: 700;
  font-size: 1.1rem;
  letter-spacing: 0.15em;
  color: #ff6b2b;
}
</style>

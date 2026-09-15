import { ref, computed } from 'vue'

const isDark = ref(true)

function toggle() {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', 'light')
  }
}

export function useTheme() {
  return {
    isDark,
    vuetifyTheme: computed(() => isDark.value ? 'sequencerTheme' : 'sequencerThemeLight'),
    toggle,
  }
}

import { ref } from 'vue'
const show = ref(false)
export function useVolumeModal() {
  return { show, open: () => { show.value = true }, close: () => { show.value = false } }
}

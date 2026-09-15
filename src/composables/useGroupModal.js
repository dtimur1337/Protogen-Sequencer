import { ref } from 'vue'
const activeGroupId = ref(null)
export function useGroupModal() {
  return {
    activeGroupId,
    open: (groupId) => { activeGroupId.value = groupId },
    close: () => { activeGroupId.value = null },
  }
}

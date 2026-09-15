import { watch } from 'vue'
import { useSequencer, PIANO_NOTES } from './useSequencer'
import { GROUPS } from '../config/samples'

const {
  bpm, masterVolume, steps,
  groupVolumes, groupReverbSends,
  laneSettings, selectedSample, laneSampleSelections,
  pads, pianoRoll,
  setSteps, loadPreset,
} = useSequencer()

function serializeProject() {
  const laneOptionLabels = {}
  const laneVolumes = {}
  const padsSnapshot = {}
  const pianoRollSnapshot = {}

  for (const group of GROUPS) {
    for (const lane of group.lanes) {
      laneVolumes[lane.id] = laneSettings[lane.id]?.volume ?? 80
      if (lane.options) {
        const url = laneSampleSelections[lane.id]
        const opt = lane.options.find(o => o.sample === url)
        if (opt) laneOptionLabels[lane.id] = opt.label
      }
      if (!group.hasNotes) {
        padsSnapshot[lane.id] = (pads[lane.id] ?? []).map(p => p.active ? 1 : 0)
      }
    }
    if (group.hasNotes) {
      pianoRollSnapshot[group.id] = {}
      for (let ni = 0; ni < PIANO_NOTES.length; ni++) {
        const row = pianoRoll[group.id][ni]
        if (row?.some(v => v > 0)) {
          pianoRollSnapshot[group.id][PIANO_NOTES[ni]] = [...row]
        }
      }
    }
  }

  return {
    version: 1,
    bpm: bpm.value,
    masterVolume: masterVolume.value,
    steps: steps.value,
    groupVolumes: { ...groupVolumes },
    groupReverbSends: { ...groupReverbSends },
    laneVolumes,
    selectedSample: { ...selectedSample },
    laneOptionLabels,
    pads: padsSnapshot,
    pianoRoll: pianoRollSnapshot,
  }
}

export async function saveProject() {
  const data = JSON.stringify(serializeProject(), null, 2)

  if ('showSaveFilePicker' in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: 'project.ptg',
        types: [{ description: 'Protogen Project', accept: { 'application/json': ['.ptg'] } }],
      })
      const writable = await handle.createWritable()
      await writable.write(data)
      await writable.close()
    } catch (e) {
      if (e.name !== 'AbortError') console.error('Save failed:', e)
    }
  } else {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }))
    a.download = 'project.ptg'
    a.click()
    URL.revokeObjectURL(a.href)
  }
}

export async function openProject() {
  let text = null

  if ('showOpenFilePicker' in window) {
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [{ description: 'Protogen Project', accept: { 'application/json': ['.ptg', '.json'] } }],
      })
      text = await (await handle.getFile()).text()
    } catch (e) {
      if (e.name !== 'AbortError') console.error('Open failed:', e)
    }
  } else {
    text = await new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.ptg,.json'
      input.onchange = async () => resolve(input.files[0] ? await input.files[0].text() : null)
      input.click()
    })
  }

  if (!text) return
  try {
    const preset = JSON.parse(text)
    if (preset.steps) setSteps(preset.steps)
    await loadPreset(preset)
  } catch (e) {
    console.error('Failed to load project:', e)
  }
}

export function tryRestoreAutosave() {
  try {
    const saved = localStorage.getItem('ptg-autosave')
    if (!saved) return
    const preset = JSON.parse(saved)
    if (preset.steps) setSteps(preset.steps)
    loadPreset(preset)
  } catch (_) {}
}

// Auto-save to localStorage 1.5s after any state change
let autoSaveTimer = null
function scheduleAutoSave() {
  clearTimeout(autoSaveTimer)
  autoSaveTimer = setTimeout(() => {
    try { localStorage.setItem('ptg-autosave', JSON.stringify(serializeProject())) } catch (_) {}
  }, 1500)
}

watch([bpm, masterVolume, steps], scheduleAutoSave)
watch(groupVolumes,     scheduleAutoSave, { deep: true })
watch(groupReverbSends, scheduleAutoSave, { deep: true })
watch(laneSettings,     scheduleAutoSave, { deep: true })
watch(selectedSample,   scheduleAutoSave, { deep: true })
watch(pads,             scheduleAutoSave, { deep: true })
watch(pianoRoll,        scheduleAutoSave, { deep: true })

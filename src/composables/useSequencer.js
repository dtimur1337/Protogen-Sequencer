import { reactive, ref, watch } from 'vue'
import { Sampler, Reverb, Gain, Transport, Draw, start as toneStart, loaded as toneLoaded } from 'tone'
import { GROUPS, STEPS, ROOT_NOTE } from '../config/samples'

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// 36 notes: C2-B4
export const PIANO_NOTES = []
for (let oct = 2; oct <= 4; oct++) {
  for (const n of NOTE_NAMES) PIANO_NOTES.push(`${n}${oct}`)
}

// --- Module-level singletons ---
let audioInitialized = false
let reverbBus = null
let masterGain = null
let _step = 0
const samplers = {}
const volumeGains = {}
const groupGains = {}
const groupReverbSendGains = {}

// --- Shared reactive state ---
const isPlaying    = ref(false)
const isLoading    = ref(false)
const currentStep  = ref(-1)
const bpm          = ref(120)
const masterVolume = ref(80)

// Per-group volume and reverb send (0-100)
const groupVolumes     = reactive({})
const groupReverbSends = reactive({})

// Pad state for non-pitched groups
const pads = reactive({})

// pianoRoll[groupId][noteIndex][stepIndex] = 0 | N (duration in steps)
const pianoRoll = reactive({
  bass:     Array.from({ length: 36 }, () => Array.from({ length: STEPS }, () => 0)),
  melodics: Array.from({ length: 36 }, () => Array.from({ length: STEPS }, () => 0)),
})

const selectedSample = reactive({ bass: 'bas2', melodics: 'syn1' })

// Per-lane volume only
const laneSettings = reactive({})

// Per-lane selected sample URL (for lanes with multiple options)
const laneSampleSelections = reactive({})

function initState() {
  for (const group of GROUPS) {
    if (!groupVolumes[group.id])     groupVolumes[group.id]     = 80
    if (!groupReverbSends[group.id]) groupReverbSends[group.id] = 0
    for (const lane of group.lanes) {
      if (!group.hasNotes && !pads[lane.id]) {
        pads[lane.id] = Array.from({ length: STEPS }, () => ({ active: false }))
      }
      if (!laneSettings[lane.id]) {
        laneSettings[lane.id] = { volume: 80 }
      }
      if (!laneSampleSelections[lane.id]) {
        laneSampleSelections[lane.id] = lane.sample
      }
    }
  }
}

async function initAudio() {
  if (audioInitialized) return
  audioInitialized = true
  isLoading.value = true

  await toneStart()

  masterGain = new Gain(masterVolume.value / 100).toDestination()

  // Shared reverb bus (fully wet); each group feeds it via its own send gain
  reverbBus = new Reverb({ decay: 2.5, wet: 1 })
  await reverbBus.ready
  reverbBus.connect(masterGain)

  for (const group of GROUPS) {
    // Group volume gain - dry path to master
    const grpGain = new Gain(groupVolumes[group.id] / 100)
    grpGain.connect(masterGain)
    groupGains[group.id] = grpGain

    // Per-group reverb send - wet path to reverb bus
    const revSend = new Gain(groupReverbSends[group.id] / 100)
    grpGain.connect(revSend)
    revSend.connect(reverbBus)
    groupReverbSendGains[group.id] = revSend

    for (const lane of group.lanes) {
      const sampler  = new Sampler({ urls: { [ROOT_NOTE]: laneSampleSelections[lane.id] ?? lane.sample }, release: 0.5 })
      const laneGain = new Gain(laneSettings[lane.id].volume / 100)
      sampler.connect(laneGain)
      laneGain.connect(grpGain)
      samplers[lane.id]    = sampler
      volumeGains[lane.id] = laneGain
    }
  }

  await toneLoaded()

  watch(masterVolume, v => { if (masterGain) masterGain.gain.value = v / 100 })

  for (const group of GROUPS) {
    watch(() => groupVolumes[group.id],     v => { if (groupGains[group.id])         groupGains[group.id].gain.value         = v / 100 })
    watch(() => groupReverbSends[group.id], v => { if (groupReverbSendGains[group.id]) groupReverbSendGains[group.id].gain.value = v / 100 })
    for (const lane of group.lanes) {
      watch(() => laneSettings[lane.id].volume, v => { if (volumeGains[lane.id]) volumeGains[lane.id].gain.value = v / 100 })
    }
  }

  Transport.scheduleRepeat((time) => {
    const step = _step

    for (const group of GROUPS) {
      if (group.hasNotes) {
        const laneId   = selectedSample[group.id]
        const stepSecs = Transport.toSeconds('16n')
        for (let ni = 0; ni < PIANO_NOTES.length; ni++) {
          const dur = pianoRoll[group.id][ni][step]
          if (dur > 0) {
            try { samplers[laneId].triggerAttackRelease(PIANO_NOTES[ni], dur * stepSecs, time) } catch (_) {}
          }
        }
      } else {
        for (const lane of group.lanes) {
          const pad = pads[lane.id]?.[step]
          if (pad?.active && samplers[lane.id]) {
            try { samplers[lane.id].triggerAttack(ROOT_NOTE, time) } catch (_) {}
          }
        }
      }
    }

    Draw.schedule(() => { currentStep.value = step }, time)
    _step = (step + 1) % STEPS
  }, '16n')

  isLoading.value = false
}

async function play() {
  if (!audioInitialized) await initAudio()
  if (isPlaying.value) return
  _step = 0
  Transport.bpm.value = bpm.value
  Transport.start()
  isPlaying.value = true
}

function stop() {
  Transport.stop()
  _step = 0
  currentStep.value = -1
  isPlaying.value = false
}

function togglePad(laneId, stepIndex) {
  const pad = pads[laneId]?.[stepIndex]
  if (pad) pad.active = !pad.active
}

function togglePianoNote(groupId, noteIndex, stepIndex) {
  pianoRoll[groupId][noteIndex][stepIndex] = pianoRoll[groupId][noteIndex][stepIndex] > 0 ? 0 : 1
}

function setPianoNote(groupId, noteIndex, stepIndex, value) {
  pianoRoll[groupId][noteIndex][stepIndex] = value
}

function setSelectedSample(groupId, sampleId) {
  selectedSample[groupId] = sampleId
}

function resetTrack() {
  stop()
  bpm.value = 120
  masterVolume.value = 80
  for (const group of GROUPS) {
    groupVolumes[group.id] = 80
    groupReverbSends[group.id] = 0
    for (const lane of group.lanes) {
      laneSettings[lane.id].volume = 80
      if (!group.hasNotes) {
        for (const pad of pads[lane.id]) pad.active = false
        if (lane.options && laneSampleSelections[lane.id] !== lane.sample) {
          setLaneSample(lane.id, lane.sample)
        }
      }
    }
  }
  for (const gId of Object.keys(selectedSample)) {
    const group = GROUPS.find(g => g.id === gId)
    if (group) selectedSample[gId] = group.lanes[0].id
  }
  for (const group of GROUPS) {
    if (group.hasNotes) {
      for (let ni = 0; ni < PIANO_NOTES.length; ni++) {
        for (let s = 0; s < STEPS; s++) pianoRoll[group.id][ni][s] = 0
      }
    }
  }
}

async function loadPreset(preset) {
  stop()
  if (preset.bpm !== undefined) bpm.value = preset.bpm
  if (preset.masterVolume !== undefined) masterVolume.value = preset.masterVolume
  for (const group of GROUPS) {
    if (preset.groupVolumes?.[group.id] !== undefined) groupVolumes[group.id] = preset.groupVolumes[group.id]
    if (preset.groupReverbSends?.[group.id] !== undefined) groupReverbSends[group.id] = preset.groupReverbSends[group.id]
    for (const lane of group.lanes) {
      laneSettings[lane.id].volume = 80
    }
  }
  if (preset.laneVolumes) {
    for (const [laneId, vol] of Object.entries(preset.laneVolumes)) {
      if (laneSettings[laneId]) laneSettings[laneId].volume = vol
    }
  }
  if (preset.selectedSample) {
    for (const [gId, sId] of Object.entries(preset.selectedSample)) selectedSample[gId] = sId
  }
  if (preset.laneOptionLabels) {
    for (const group of GROUPS) {
      for (const lane of group.lanes) {
        const label = preset.laneOptionLabels[lane.id]
        if (label && lane.options) {
          const opt = lane.options.find(o => o.label === label)
          if (opt) await setLaneSample(lane.id, opt.sample)
        }
      }
    }
  }
  if (preset.pads) {
    for (const [laneId, steps] of Object.entries(preset.pads)) {
      if (pads[laneId]) {
        for (let i = 0; i < steps.length; i++) pads[laneId][i].active = !!steps[i]
      }
    }
  }
  if (preset.pianoRoll) {
    for (const [groupId, noteMap] of Object.entries(preset.pianoRoll)) {
      for (let ni = 0; ni < PIANO_NOTES.length; ni++) {
        for (let s = 0; s < STEPS; s++) pianoRoll[groupId][ni][s] = 0
      }
      for (const [noteName, steps] of Object.entries(noteMap)) {
        const ni = PIANO_NOTES.indexOf(noteName)
        if (ni === -1) continue
        for (let s = 0; s < steps.length; s++) pianoRoll[groupId][ni][s] = steps[s]
      }
    }
  }
}

async function setLaneSample(laneId, url) {
  laneSampleSelections[laneId] = url
  if (!audioInitialized) return
  const oldSampler = samplers[laneId]
  const newSampler = new Sampler({ urls: { [ROOT_NOTE]: url }, release: 0.5 })
  newSampler.connect(volumeGains[laneId])
  await toneLoaded()
  samplers[laneId] = newSampler
  oldSampler?.dispose()
}

async function previewNote(groupId, note) {
  if (!audioInitialized) await initAudio()
  const laneId = selectedSample[groupId]
  if (!samplers[laneId]) return
  try { samplers[laneId].triggerAttackRelease(note, '8n') } catch (_) {}
}

watch(bpm, (val) => { Transport.bpm.value = val })

initState()

export function useSequencer() {
  return {
    isPlaying, isLoading, currentStep, bpm, masterVolume,
    groupVolumes, groupReverbSends,
    pads, pianoRoll, selectedSample, laneSettings, laneSampleSelections,
    play, stop,
    togglePad, togglePianoNote, setPianoNote, setSelectedSample,
    setLaneSample, previewNote,
    resetTrack, loadPreset,
  }
}

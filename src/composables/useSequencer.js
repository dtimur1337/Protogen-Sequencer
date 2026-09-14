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
      const sampler  = new Sampler({ urls: { [ROOT_NOTE]: lane.sample }, release: 0.5 })
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
    pads, pianoRoll, selectedSample, laneSettings,
    play, stop,
    togglePad, togglePianoNote, setPianoNote, setSelectedSample,
    previewNote,
  }
}

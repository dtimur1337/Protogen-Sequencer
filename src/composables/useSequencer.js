import { reactive, ref, watch } from 'vue'
import { Sampler, Reverb, Gain, Transport, Draw, start as toneStart, loaded as toneLoaded } from 'tone'
import { GROUPS, STEPS, ROOT_NOTE } from '../config/samples'

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// 36 notes: C2–B4
export const PIANO_NOTES = []
for (let oct = 2; oct <= 4; oct++) {
  for (const n of NOTE_NAMES) PIANO_NOTES.push(`${n}${oct}`)
}

// --- Module-level singletons ---
let audioInitialized = false
let reverbBus = null
let _step = 0
const samplers = {}
const volumeGains = {}
const reverbSendGains = {}

// --- Shared reactive state ---
const isPlaying = ref(false)
const isLoading = ref(false)
const currentStep = ref(-1)
const bpm = ref(120)

// Pad state for non-pitched groups (Drums, FX)
const pads = reactive({})

// Piano roll state for pitched groups (Bass, Melodics)
// pianoRoll[groupId][noteIndex][stepIndex] = boolean
const pianoRoll = reactive({
  bass:     Array.from({ length: 36 }, () => Array.from({ length: STEPS }, () => false)),
  melodics: Array.from({ length: 36 }, () => Array.from({ length: STEPS }, () => false)),
})

// Which sample is active per pitched group
const selectedSample = reactive({ bass: 'bas1', melodics: 'syn1' })

// Per-lane audio settings (used by all lanes, but pitched groups show selected lane's settings)
const laneSettings = reactive({})

function initState() {
  for (const group of GROUPS) {
    for (const lane of group.lanes) {
      if (!group.hasNotes && !pads[lane.id]) {
        pads[lane.id] = Array.from({ length: STEPS }, () => ({ active: false }))
      }
      if (!laneSettings[lane.id]) {
        laneSettings[lane.id] = { volume: 80, reverbSend: 0 }
      }
    }
  }
}

async function initAudio() {
  if (audioInitialized) return
  audioInitialized = true
  isLoading.value = true

  await toneStart()

  reverbBus = new Reverb({ decay: 2.5, wet: 1 }).toDestination()
  await reverbBus.ready

  for (const group of GROUPS) {
    for (const lane of group.lanes) {
      const sampler = new Sampler({ urls: { [ROOT_NOTE]: lane.sample }, release: 0.5 })
      const volGain = new Gain(laneSettings[lane.id].volume / 100)
      const revGain = new Gain(laneSettings[lane.id].reverbSend / 100)

      sampler.connect(volGain)
      volGain.toDestination()
      volGain.connect(revGain)
      revGain.connect(reverbBus)

      samplers[lane.id] = sampler
      volumeGains[lane.id] = volGain
      reverbSendGains[lane.id] = revGain
    }
  }

  await toneLoaded()

  for (const group of GROUPS) {
    for (const lane of group.lanes) {
      watch(() => laneSettings[lane.id].volume,    (v) => { if (volumeGains[lane.id])    volumeGains[lane.id].gain.value    = v / 100 })
      watch(() => laneSettings[lane.id].reverbSend, (v) => { if (reverbSendGains[lane.id]) reverbSendGains[lane.id].gain.value = v / 100 })
    }
  }

  Transport.scheduleRepeat((time) => {
    const step = _step

    for (const group of GROUPS) {
      if (group.hasNotes) {
        const laneId = selectedSample[group.id]
        for (let ni = 0; ni < PIANO_NOTES.length; ni++) {
          if (pianoRoll[group.id][ni][step]) {
            try { samplers[laneId].triggerAttack(PIANO_NOTES[ni], time) } catch (_) {}
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
  pianoRoll[groupId][noteIndex][stepIndex] = !pianoRoll[groupId][noteIndex][stepIndex]
}

function setSelectedSample(groupId, sampleId) {
  selectedSample[groupId] = sampleId
}

watch(bpm, (val) => { Transport.bpm.value = val })

initState()

export function useSequencer() {
  return {
    isPlaying, isLoading, currentStep, bpm,
    pads, pianoRoll, selectedSample, laneSettings,
    play, stop,
    togglePad, togglePianoNote, setSelectedSample,
  }
}

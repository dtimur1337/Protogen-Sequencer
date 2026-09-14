import { reactive, ref, watch } from 'vue'
import { Sampler, Reverb, Gain, Transport, Draw, start as toneStart, loaded as toneLoaded } from 'tone'
import { GROUPS, STEPS, ROOT_NOTE } from '../config/samples'

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

function noteToMidi(note) {
  const m = note.match(/^([A-G]#?)(\d)$/)
  if (!m) return 48
  return (parseInt(m[2]) + 1) * 12 + NOTE_NAMES.indexOf(m[1])
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
const pads = reactive({})
const laneSettings = reactive({})
const notePicker = reactive({ open: false, laneId: null, stepIndex: null })

function initState() {
  for (const group of GROUPS) {
    for (const lane of group.lanes) {
      if (!pads[lane.id]) {
        pads[lane.id] = Array.from({ length: STEPS }, () => ({ active: false, note: ROOT_NOTE }))
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

  // Live-update audio params when sliders move
  for (const group of GROUPS) {
    for (const lane of group.lanes) {
      watch(() => laneSettings[lane.id].volume,    (v) => { if (volumeGains[lane.id])    volumeGains[lane.id].gain.value    = v / 100 })
      watch(() => laneSettings[lane.id].reverbSend, (v) => { if (reverbSendGains[lane.id]) reverbSendGains[lane.id].gain.value = v / 100 })
    }
  }

  Transport.scheduleRepeat((time) => {
    const step = _step

    for (const group of GROUPS) {
      for (const lane of group.lanes) {
        const pad = pads[lane.id]?.[step]
        if (pad?.active && samplers[lane.id]) {
          const note = group.hasNotes ? pad.note : ROOT_NOTE
          try { samplers[lane.id].triggerAttack(note, time) } catch (_) {}
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

function openNotePicker(laneId, stepIndex) {
  notePicker.laneId = laneId
  notePicker.stepIndex = stepIndex
  notePicker.open = true
}

function selectNote(note) {
  if (notePicker.laneId !== null && notePicker.stepIndex !== null) {
    const pad = pads[notePicker.laneId]?.[notePicker.stepIndex]
    if (pad) pad.note = note
  }
  notePicker.open = false
  notePicker.laneId = null
  notePicker.stepIndex = null
}

watch(bpm, (val) => { Transport.bpm.value = val })

initState()

export function useSequencer() {
  return {
    isPlaying, isLoading, currentStep, bpm,
    pads, laneSettings, notePicker,
    play, stop, togglePad, openNotePicker, selectNote,
  }
}

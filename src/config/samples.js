export const STEPS = 32  // max pre-allocated steps
export const ROOT_NOTE = 'C3'

export const GROUPS = [
  {
    id: 'drums',
    name: 'Drums',
    hasNotes: false,
    color: '#ff6b2b',
    lanes: [
      {
        id: 'kick', name: 'Kick',
        sample: new URL('../assets/samples/Drums/Kick/KIC 1.wav', import.meta.url).href,
        options: [
          { label: 'KIC 1', sample: new URL('../assets/samples/Drums/Kick/KIC 1.wav', import.meta.url).href },
          { label: 'KIC 2', sample: new URL('../assets/samples/Drums/Kick/KIC 2.wav', import.meta.url).href },
          { label: 'KIC 3', sample: new URL('../assets/samples/Drums/Kick/KIC 3.wav', import.meta.url).href },
          { label: 'KIC 4', sample: new URL('../assets/samples/Drums/Kick/KIC 4.wav', import.meta.url).href },
        ],
      },
      {
        id: 'snare', name: 'Snare',
        sample: new URL('../assets/samples/Drums/Snare/SNA 1.wav', import.meta.url).href,
        options: [
          { label: 'SNA 1', sample: new URL('../assets/samples/Drums/Snare/SNA 1.wav', import.meta.url).href },
          { label: 'SNA 2', sample: new URL('../assets/samples/Drums/Snare/SNA 2.wav', import.meta.url).href },
          { label: 'SNA 3', sample: new URL('../assets/samples/Drums/Snare/SNA 3.wav', import.meta.url).href },
          { label: 'SNA 4', sample: new URL('../assets/samples/Drums/Snare/SNA 4.wav', import.meta.url).href },
        ],
      },
      {
        id: 'hihat', name: 'Hi-Hat',
        sample: new URL('../assets/samples/Drums/HH/HAT 1.wav', import.meta.url).href,
        options: [
          { label: 'HAT 1', sample: new URL('../assets/samples/Drums/HH/HAT 1.wav', import.meta.url).href },
          { label: 'HAT 2', sample: new URL('../assets/samples/Drums/HH/HAT 2.wav', import.meta.url).href },
          { label: 'HAT 3', sample: new URL('../assets/samples/Drums/HH/HAT 3.wav', import.meta.url).href },
          { label: 'HAT 4', sample: new URL('../assets/samples/Drums/HH/HAT 4.wav', import.meta.url).href },
        ],
      },
      {
        id: 'crash', name: 'Crash',
        sample: new URL('../assets/samples/Drums/Crash/CRASH1.wav', import.meta.url).href,
        options: [
          { label: 'CRASH 1', sample: new URL('../assets/samples/Drums/Crash/CRASH1.wav', import.meta.url).href },
          { label: 'CRASH 2', sample: new URL('../assets/samples/Drums/Crash/CRASH2.wav', import.meta.url).href },
          { label: 'CRASH 3', sample: new URL('../assets/samples/Drums/Crash/CRASH3.wav', import.meta.url).href },
          { label: 'CRASH 4', sample: new URL('../assets/samples/Drums/Crash/CRASH4.wav', import.meta.url).href },
        ],
      },
    ],
  },
  {
    id: 'bass',
    name: 'Bass',
    hasNotes: true,
    color: '#1e90ff',
    lanes: [
      { id: 'bas2', name: 'BAS 2', sample: new URL('../assets/samples/Bass/BAS 2.wav', import.meta.url).href },
      { id: 'bas1', name: 'BAS 1', sample: new URL('../assets/samples/Bass/BAS 1.wav', import.meta.url).href },
      { id: 'bas3', name: 'BAS 3', sample: new URL('../assets/samples/Bass/BAS 3.wav', import.meta.url).href },
      { id: 'bas4', name: 'BAS 4', sample: new URL('../assets/samples/Bass/BAS 4.wav', import.meta.url).href },
    ],
  },
  {
    id: 'melodics',
    name: 'Melodics',
    hasNotes: true,
    color: '#00d4ff',
    lanes: [
      { id: 'syn1', name: 'SYN 1', sample: new URL('../assets/samples/Melodics/SYN 1.wav', import.meta.url).href },
      { id: 'syn2', name: 'SYN 2', sample: new URL('../assets/samples/Melodics/SYN 2.wav', import.meta.url).href },
      { id: 'syn3', name: 'SYN 3', sample: new URL('../assets/samples/Melodics/SYN 3.wav', import.meta.url).href },
      { id: 'syn4', name: 'SYN 4', sample: new URL('../assets/samples/Melodics/SYN 4.wav', import.meta.url).href },
    ],
  },
  {
    id: 'fx',
    name: 'FX',
    hasNotes: false,
    color: '#00c896',
    lanes: [
      { id: 'fx1', name: 'Scene/Sea', sample: new URL('../assets/samples/FX/Atmos-ASceneByTheSea.wav',    import.meta.url).href },
      { id: 'fx2', name: 'Beautiful', sample: new URL('../assets/samples/FX/Atmos-MostBeautifull.wav',    import.meta.url).href },
      { id: 'fx3', name: 'Pear Gdn',  sample: new URL('../assets/samples/FX/Atmos-PearGarden.wav',        import.meta.url).href },
      { id: 'fx4', name: 'Noordzee',  sample: new URL('../assets/samples/FX/atmos-NoordzeeGong 1.wav',    import.meta.url).href },
    ],
  },
]

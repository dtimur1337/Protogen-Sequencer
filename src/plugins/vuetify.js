import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

const sequencerTheme = {
  dark: true,
  colors: {
    background: '#0a0e1a',
    surface: '#0d1420',
    'surface-variant': '#1a2235',
    primary: '#ff6b2b',
    secondary: '#1e90ff',
    accent: '#00d4ff',
    error: '#ff4444',
    warning: '#ffaa00',
    info: '#1e90ff',
    success: '#00c896',
  },
}

const sequencerThemeLight = {
  dark: false,
  colors: {
    background: '#edf0f7',
    surface: '#f4f7fb',
    'surface-variant': '#e4e9f3',
    primary: '#c44e00',
    secondary: '#3a6090',
    accent: '#1e7090',
    error: '#cc2222',
    warning: '#cc8800',
    info: '#3a6090',
    success: '#008060',
  },
}

export default createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: 'sequencerTheme',
    themes: { sequencerTheme, sequencerThemeLight },
  },
})

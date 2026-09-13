import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

const sequencerTheme = {
  dark: true,
  colors: {
    background: '#0a0e1a',
    surface: '#111827',
    'surface-variant': '#1a2235',
    primary: '#ff6b2b',       // orange accent
    secondary: '#1e90ff',     // electric blue
    accent: '#00d4ff',        // cyan highlight
    error: '#ff4444',
    warning: '#ffaa00',
    info: '#1e90ff',
    success: '#00c896',
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
    themes: { sequencerTheme },
  },
})

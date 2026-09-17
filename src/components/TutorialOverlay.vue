<template>
  <teleport to="body">
    <transition name="tfade">
      <div v-if="active" class="t-root" :class="{ 't-root--hidden': !visible }">

        <!-- Four-panel backdrop — creates a cutout without box-shadow -->
        <template v-if="rect">
          <div class="t-veil" :style="veilTop" />
          <div class="t-veil" :style="veilLeft" />
          <div class="t-veil" :style="veilRight" />
          <div class="t-veil" :style="veilBottom" />
        </template>
        <div v-else class="t-veil t-veil--full" />

        <!-- Spotlight outline -->
        <div v-if="rect" class="t-spot" :style="spotStyle" />

        <!-- Tooltip card -->
        <div v-if="rect" class="t-tip" :style="tipStyle">
          <div class="t-label">{{ step.label }}</div>
          <p class="t-desc">{{ step.desc }}</p>
          <div class="t-nav">
            <div class="t-dots">
              <span
                v-for="(_, i) in STEPS" :key="i"
                class="t-dot" :class="{ on: i === idx }"
              />
            </div>
            <div class="t-btns">
              <button v-if="idx > 0" class="t-btn" @click="prev">BACK</button>
              <button class="t-btn t-btn--hi" @click="advance">
                {{ idx < STEPS.length - 1 ? 'NEXT →' : 'DONE' }}
              </button>
            </div>
          </div>
          <button class="t-skip" @click="finish">skip tour</button>
        </div>

      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

const PAD = 10
const TIP_W = 300
const TIP_H = 200

const STEPS = [
  {
    label: 'APP CONTROLS',
    getEl: () => window.innerWidth <= 599
      ? document.querySelector('.burger-btn')
      : document.querySelector('.header-actions'),
    desc: 'Create a new blank track, open a saved .ptg project, save your work, or load the built-in demo pattern.',
  },
  {
    label: 'TRANSPORT',
    getEl: () => document.querySelector('.transport'),
    desc: 'Play or stop the sequence, open the mixer, set your tempo in BPM, and choose pattern length — 16, 32, or 64 steps.',
  },
  {
    label: 'DRUMS',
    getEl: () => document.querySelectorAll('.group-panel')[0],
    desc: 'Program kick, snare, hi-hat, and crash patterns. Toggle pads on and off to build your beat — each row is one instrument.',
  },
  {
    label: 'BASS & MELODICS',
    getEl: () => {
      const panel = document.querySelectorAll('.group-panel')[1]
      if (!panel) return null
      const keys = [...panel.querySelectorAll('.key-strip')].slice(0, 12)
      if (!keys.length) return null
      const stepsScroll = panel.querySelector('.steps-scroll')
      return {
        scrollIntoView: (opts) => keys[0].scrollIntoView(opts),
        getBoundingClientRect: () => {
          const rects = keys.map(k => k.getBoundingClientRect())
          const top    = Math.min(...rects.map(r => r.top))
          const left   = Math.min(...rects.map(r => r.left))
          const bottom = Math.max(...rects.map(r => r.bottom))
          const right  = stepsScroll ? stepsScroll.getBoundingClientRect().right : left + 300
          return { top, left, right, bottom, width: right - left, height: bottom - top }
        },
      }
    },
    desc: 'Draw notes on the piano roll for bass lines and melodies. Click to place a note, drag right to extend it, click again to erase.',
  },
]

const active = ref(false)
const visible = ref(false)
const idx = ref(0)
const rect = ref(null)

const step = computed(() => STEPS[idx.value])

function updateRect() {
  const el = step.value.getEl()
  if (!el) { rect.value = null; return }
  rect.value = el.getBoundingClientRect()
}

// Four veils that together form the darkened surround
const veilTop = computed(() => {
  const r = rect.value
  return { top: '0', left: '0', right: '0', height: `${Math.max(0, r.top - PAD)}px` }
})
const veilBottom = computed(() => {
  const r = rect.value
  return { top: `${r.bottom + PAD}px`, left: '0', right: '0', bottom: '0' }
})
const veilLeft = computed(() => {
  const r = rect.value
  return {
    top: `${r.top - PAD}px`,
    left: '0',
    width: `${Math.max(0, r.left - PAD)}px`,
    height: `${r.height + PAD * 2}px`,
  }
})
const veilRight = computed(() => {
  const r = rect.value
  return {
    top: `${r.top - PAD}px`,
    left: `${r.right + PAD}px`,
    right: '0',
    height: `${r.height + PAD * 2}px`,
  }
})

const spotStyle = computed(() => {
  if (!rect.value) return {}
  const r = rect.value
  return {
    left:   `${r.left   - PAD}px`,
    top:    `${r.top    - PAD}px`,
    width:  `${r.width  + PAD * 2}px`,
    height: `${r.height + PAD * 2}px`,
  }
})

const tipStyle = computed(() => {
  if (!rect.value) return {}
  const r = rect.value
  const vw = window.visualViewport?.width || window.innerWidth || document.documentElement.clientWidth || 1024
  const vh = window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight || 812
  const gap = 16
  const below = r.bottom + gap + TIP_H < vh
  const top = below ? r.bottom + gap : r.top - gap - TIP_H
  const left = Math.min(Math.max(r.left, 16), Math.max(vw - TIP_W - 16, 16))
  return { top: `${top}px`, left: `${left}px`, width: `${TIP_W}px` }
})

async function goTo(i) {
  if (visible.value) {
    visible.value = false
    await new Promise(r => setTimeout(r, 180))
  }
  rect.value = null
  idx.value = i
  await nextTick()
  const el = step.value.getEl()
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    await new Promise(r => setTimeout(r, 220))
    updateRect()
  }
  await nextTick()
  visible.value = true
}

function advance() {
  if (idx.value < STEPS.length - 1) goTo(idx.value + 1)
  else finish()
}

function prev() { if (idx.value > 0) goTo(idx.value - 1) }

function finish() {
  active.value = false
  localStorage.setItem('ptg-tutorial-done', '1')
}

onMounted(() => {
  if (!localStorage.getItem('ptg-tutorial-done')) {
    active.value = true
    nextTick(() => goTo(0))
  }
  window.addEventListener('resize', updateRect)
})
onUnmounted(() => window.removeEventListener('resize', updateRect))
</script>

<style scoped>
.t-root {
  position: fixed;
  inset: 0;
  z-index: 9900;
  pointer-events: none;
  transition: opacity 0.18s ease;
}

.t-root--hidden {
  opacity: 0;
}
.t-root--hidden .t-veil {
  pointer-events: none;
}

.t-veil {
  position: fixed;
  background: rgba(0, 0, 0, 0.76);
  pointer-events: all;
  transition: top 0.35s ease, left 0.35s ease, right 0.35s ease,
              bottom 0.35s ease, width 0.35s ease, height 0.35s ease;
}

.t-veil--full {
  inset: 0;
}

.t-spot {
  position: fixed;
  border-radius: 6px;
  border: 1.5px solid color-mix(in srgb, var(--c-accent) 55%, transparent);
  pointer-events: none;
  z-index: 9901;
  transition: left 0.35s ease, top 0.35s ease, width 0.35s ease, height 0.35s ease;
}

.t-tip {
  position: fixed;
  background: var(--c-surf);
  border: 1px solid var(--c-border);
  border-radius: 6px;
  padding: 18px 20px 14px;
  pointer-events: all;
  z-index: 9902;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
}

.t-label {
  font-family: 'Courier New', monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.22em;
  color: var(--c-accent);
}

.t-desc {
  font-family: 'Courier New', monospace;
  font-size: 12.5px;
  line-height: 1.65;
  color: var(--c-text-1);
  margin: 0;
}

.t-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2px;
}

.t-dots { display: flex; gap: 6px; align-items: center; }

.t-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--c-border-3);
  transition: background 0.2s;
}
.t-dot.on { background: var(--c-accent); }

.t-btns { display: flex; gap: 6px; }

.t-btn {
  font-family: 'Courier New', monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  padding: 6px 14px;
  background: transparent;
  border: 1px solid var(--c-border-2);
  border-radius: 2px;
  color: var(--c-text-2);
  cursor: pointer;
  transition: background 0.1s, border-color 0.1s, color 0.1s;
}
.t-btn:hover { border-color: var(--c-border-3); color: var(--c-text-1); background: var(--c-pad); }

.t-btn--hi { border-color: var(--c-accent-dim); color: var(--c-accent); }
.t-btn--hi:hover { border-color: var(--c-accent); background: var(--c-accent-bg); }

.t-skip {
  font-family: 'Courier New', monospace;
  font-size: 9px;
  letter-spacing: 0.1em;
  color: var(--c-text-3);
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  padding: 0;
  transition: color 0.1s;
}
.t-skip:hover { color: var(--c-text-2); }

.tfade-enter-active, .tfade-leave-active { transition: opacity 0.2s; }
.tfade-enter-from, .tfade-leave-to { opacity: 0; }
</style>

<script setup lang="ts">
const { notes, pan, zoom, selectedId } = useBoard()

const MIN_ZOOM = 0.2
const MAX_ZOOM = 3

const spaceDown = ref(false)
const panning = ref(false)

// Punkte liegen auf Vielfachen von GRID, damit Post-its genau auf ihnen einrasten
const backgroundStyle = computed(() => ({
  backgroundImage: 'radial-gradient(circle, #d4d4d4 1.5px, transparent 1.5px)',
  backgroundSize: `${GRID * zoom.value}px ${GRID * zoom.value}px`,
  backgroundPosition: `${pan.value.x - (GRID * zoom.value) / 2}px ${pan.value.y - (GRID * zoom.value) / 2}px`
}))

// CMD + Mausrad bzw. Pinch: zoomt so, dass der Punkt unter dem Mauszeiger stehen bleibt
function onWheel(event: WheelEvent) {
  if (!event.metaKey && !event.ctrlKey) return
  event.preventDefault()
  const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom.value * Math.exp(-event.deltaY * 0.01)))
  const worldX = (event.clientX - pan.value.x) / zoom.value
  const worldY = (event.clientY - pan.value.y) / zoom.value
  pan.value = { x: event.clientX - worldX * next, y: event.clientY - worldY * next }
  zoom.value = next
}

function onKeyDown(event: KeyboardEvent) {
  if (event.code !== 'Space' || event.target instanceof HTMLTextAreaElement) return
  event.preventDefault()
  spaceDown.value = true
}

function onKeyUp(event: KeyboardEvent) {
  if (event.code === 'Space') spaceDown.value = false
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
})

// Leertaste + Ziehen verschiebt den Canvas – auch über Post-its hinweg
function onPointerDownCapture(event: PointerEvent) {
  if (!spaceDown.value) return
  event.stopPropagation()
  const start = { ...pan.value }
  panning.value = true
  startDrag(
    event,
    (dx, dy) => (pan.value = { x: start.x + dx, y: start.y + dy }),
    () => (panning.value = false)
  )
}

function onBackgroundPointerDown() {
  if (!spaceDown.value) selectedId.value = null
}
</script>

<template>
  <div
    class="fixed inset-0 overflow-hidden bg-neutral-50 select-none"
    :class="panning ? 'cursor-grabbing' : spaceDown && 'cursor-grab'"
    :style="backgroundStyle"
    @pointerdown.capture="onPointerDownCapture"
    @pointerdown.self="onBackgroundPointerDown"
    @wheel="onWheel"
  >
    <div
      class="absolute top-0 left-0 origin-top-left"
      :style="{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }"
    >
      <StickyNote v-for="note in notes" :key="note.id" :note="note" />
    </div>
  </div>
</template>

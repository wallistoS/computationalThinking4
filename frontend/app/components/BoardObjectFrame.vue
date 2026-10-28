<script setup lang="ts">
import type { BoardObject, Corner, Rect } from '~/models/board-object'

type Mode = 'move' | Corner

const HANDLE_CLASSES: Record<Corner, string> = {
  nw: 'left-0 top-0 cursor-nwse-resize',
  ne: 'left-full top-0 cursor-nesw-resize',
  sw: 'left-0 top-full cursor-nesw-resize',
  se: 'left-full top-full cursor-nwse-resize',
}

// Shared frame for every board object: reports select, move and resize, and toggles editing.
const props = defineProps<{ object: BoardObject; selected?: boolean }>()
const emit = defineEmits<{
  select: []
  move: [x: number, y: number]
  resize: [start: Rect, corner: Corner, dx: number, dy: number]
}>()

const scale = inject<Ref<number>>('canvasScale', ref(1))
const editing = ref(false)

let interaction: { mode: Mode; startX: number; startY: number; start: Rect } | null = null

function startInteraction(event: PointerEvent, mode: Mode) {
  event.stopPropagation()
  emit('select')
  if (editing.value) return
  interaction = { mode, startX: event.clientX, startY: event.clientY, start: props.object.rect() }
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent) {
  if (!interaction) return
  const { mode, start } = interaction
  const dx = (event.clientX - interaction.startX) / scale.value
  const dy = (event.clientY - interaction.startY) / scale.value
  if (mode === 'move') emit('move', start.x + dx, start.y + dy)
  else emit('resize', start, mode, dx, dy)
}

function onPointerUp() {
  interaction = null
}

function stopEditing() {
  editing.value = false
}
</script>

<template>
  <div
    class="absolute touch-none"
    :class="[selected && object.border ? 'ring-2 ring-blue-300' : '', editing ? 'cursor-text' : 'cursor-move']"
    :style="{ left: `${object.x}px`, top: `${object.y}px`, width: `${object.width}px`, height: `${object.height}px` }"
    @pointerdown="startInteraction($event, 'move')"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @dblclick="editing = true"
  >
    <slot :editing="editing" :stop-editing="stopEditing" />

    <template v-if="selected && !editing">
      <div
        v-for="(classes, corner) in HANDLE_CLASSES"
        :key="corner"
        class="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-sm border-2 border-blue-500 bg-background"
        :class="classes"
        @pointerdown="startInteraction($event, corner)"
      />
    </template>
  </div>
</template>

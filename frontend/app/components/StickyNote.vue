<script setup lang="ts">
import type { Note } from '~/composables/useBoard'

const props = defineProps<{ note: Note }>()
const { selectedId, zoom } = useBoard()

const editing = ref(false)
const textarea = ref<HTMLTextAreaElement>()
const selected = computed(() => selectedId.value === props.note.id)

function onMoveStart(event: PointerEvent) {
  if (editing.value) return
  selectedId.value = props.note.id
  const { x, y } = props.note
  startDrag(event, (dx, dy) => {
    props.note.x = snap(x + dx / zoom.value)
    props.note.y = snap(y + dy / zoom.value)
  })
}

// CMD gedrückt: Seitenverhältnis bleibt erhalten
function onResizeStart(event: PointerEvent) {
  event.stopPropagation()
  const { w, h } = props.note
  startDrag(event, (dx, dy, moveEvent) => {
    let width = w + dx / zoom.value
    let height = h + dy / zoom.value
    if (moveEvent.metaKey) {
      const factor = Math.max(width / w, height / h)
      width = w * factor
      height = h * factor
    }
    props.note.w = Math.max(GRID * 2, snap(width))
    props.note.h = Math.max(GRID * 2, snap(height))
  })
}

async function startEditing() {
  editing.value = true
  await nextTick()
  textarea.value?.focus()
}
</script>

<template>
  <div
    class="absolute rounded-sm p-3 shadow-md"
    :class="selected && 'ring-2 ring-blue-500'"
    :style="{
      left: `${note.x}px`,
      top: `${note.y}px`,
      width: `${note.w}px`,
      height: `${note.h}px`,
      background: note.color
    }"
    @pointerdown="onMoveStart"
    @dblclick="startEditing"
  >
    <textarea
      v-if="editing"
      ref="textarea"
      v-model="note.text"
      class="size-full resize-none bg-transparent outline-none select-text"
      @blur="editing = false"
    />
    <p v-else class="size-full overflow-hidden break-words whitespace-pre-wrap">{{ note.text }}</p>

    <div
      v-if="selected"
      class="absolute -right-1.5 -bottom-1.5 size-3 cursor-nwse-resize border-2 border-blue-500 bg-white"
      @pointerdown="onResizeStart"
    />
  </div>
</template>

<script setup lang="ts">
import { Bold } from '@lucide/vue'
import type { BoardObject, CircleObject, NoteObject } from '~/models/board-object'

const FONT_SIZES = [
  { label: 'S', size: 14 },
  { label: 'M', size: 18 },
  { label: 'L', size: 24 },
]

// Floating bar above the selected object; the object's class decides which editors appear.
const props = defineProps<{ object: BoardObject }>()
const board = useBoard()
const scale = inject<Ref<number>>('canvasScale', ref(1))

const colored = computed(() => props.object as NoteObject | CircleObject)
</script>

<template>
  <div
    class="absolute z-10 flex origin-bottom items-center gap-1 rounded-lg border bg-background p-1 shadow-md"
    :style="{
      left: `${object.x + object.width / 2}px`,
      top: `${object.y - 12 / scale}px`,
      transform: `translate(-50%, -100%) scale(${1 / scale})`,
    }"
    @pointerdown.stop
  >
    <template v-for="editor in object.editors" :key="editor">
      <div v-if="editor === 'color'" class="flex gap-1 px-1">
        <button
          v-for="color in colored.palette"
          :key="color"
          class="size-6 rounded-full border"
          :class="colored.color === color && 'ring-2 ring-blue-500 ring-offset-1'"
          :style="{ backgroundColor: color }"
          @click="board.setStyle(object.id, { color })"
        />
      </div>
      <div v-else-if="editor === 'fontSize'" class="flex">
        <button
          v-for="{ label, size } in FONT_SIZES"
          :key="size"
          class="size-8 rounded-md text-sm font-medium hover:bg-muted"
          :class="object.fontSize === size && 'bg-muted'"
          @click="board.setStyle(object.id, { fontSize: size })"
        >
          {{ label }}
        </button>
      </div>
      <button
        v-else-if="editor === 'bold'"
        class="grid size-8 place-items-center rounded-md hover:bg-muted"
        :class="object.bold && 'bg-muted'"
        @click="board.setStyle(object.id, { bold: !object.bold })"
      >
        <Bold class="size-4" />
      </button>
    </template>
  </div>
</template>

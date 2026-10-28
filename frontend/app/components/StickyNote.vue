<script setup lang="ts">
import type { NoteObject } from '~/models/board-object'

// `selected`, `@select`, `@move` and `@resize` fall through to BoardObjectFrame.
defineProps<{ object: NoteObject }>()
const emit = defineEmits<{ text: [text: string]; fit: [size: number] }>()
</script>

<template>
  <BoardObjectFrame
    v-slot="{ editing, stopEditing }"
    :object="object"
    class="shadow-md"
    :style="{ backgroundColor: object.color, fontSize: `${object.fontSize}px`, fontWeight: object.bold ? 700 : 400 }"
  >
    <EditableText
      class="p-4"
      :text="object.text"
      :editing="editing"
      @input="emit('text', $event)"
      @stop="stopEditing"
      @fit="emit('fit', $event)"
    />
  </BoardObjectFrame>
</template>

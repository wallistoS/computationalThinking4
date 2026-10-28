<script setup lang="ts">
import type { TextObject } from '~/models/board-object'

// `selected`, `@select`, `@move` and `@resize` fall through to BoardObjectFrame.
defineProps<{ object: TextObject }>()
const emit = defineEmits<{ text: [text: string]; fit: [size: number] }>()
</script>

<template>
  <BoardObjectFrame
    v-slot="{ editing, stopEditing }"
    :object="object"
    :style="{ fontSize: `${object.fontSize}px`, fontWeight: object.bold ? 700 : 400 }"
  >
    <EditableText
      class="p-2"
      placeholder="Text"
      :text="object.text"
      :editing="editing"
      @input="emit('text', $event)"
      @stop="stopEditing"
      @fit="emit('fit', $event)"
    />
  </BoardObjectFrame>
</template>

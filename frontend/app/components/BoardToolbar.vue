<script setup lang="ts">
import { Type } from '@lucide/vue'
import { CIRCLE_COLORS, NOTE_COLORS, type BoardObjectType } from '~/models/board-object'

const NOTE_ROTATIONS = [-4, 2, 4]

const emit = defineEmits<{ add: [type: BoardObjectType, color?: string] }>()
</script>

<template>
  <div class="fixed bottom-4 left-1/2 flex h-24 -translate-x-1/2 items-end gap-6 overflow-hidden rounded-3xl border bg-background px-8 shadow-lg">
    <button
      v-for="(color, index) in NOTE_COLORS"
      :key="color"
      class="size-20 translate-y-4 shadow-md transition-transform hover:translate-y-1"
      :style="{ backgroundColor: color, rotate: `${NOTE_ROTATIONS[index]}deg` }"
      @click="emit('add', 'note', color)"
    />
    <div class="mb-4 h-16 w-px self-end bg-border" />
    <button class="grid h-full w-14 place-items-center hover:text-muted-foreground" @click="emit('add', 'text')">
      <Type class="size-9" :stroke-width="2.5" />
    </button>
    <div class="mb-4 h-16 w-px self-end bg-border" />
    <button
      v-for="color in CIRCLE_COLORS"
      :key="color"
      class="size-20 translate-y-4 rounded-full border border-black/10 shadow-md transition-transform hover:translate-y-1"
      :style="{ backgroundColor: color }"
      @click="emit('add', 'circle', color)"
    />
  </div>
</template>

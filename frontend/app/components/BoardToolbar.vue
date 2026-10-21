<script setup lang="ts">
const { addNote, selectedNote } = useBoard()
</script>

<template>
  <div class="fixed top-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-white p-2 shadow-md">
    <button class="rounded-md px-3 py-1.5 text-sm font-medium hover:bg-neutral-100" @click="addNote">
      + Post-it
    </button>

    <template v-if="selectedNote">
      <div class="h-6 w-px bg-neutral-200" />
      <button
        v-for="color in NOTE_COLORS"
        :key="color"
        class="size-6 rounded-full border border-black/10"
        :class="selectedNote.color === color && 'ring-2 ring-blue-500 ring-offset-1'"
        :style="{ background: color }"
        @click="selectedNote.color = color"
      />
    </template>
  </div>
</template>

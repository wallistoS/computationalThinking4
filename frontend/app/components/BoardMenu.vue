<script setup lang="ts">
import { Check, ChevronDown, Pencil, Plus, Trash2 } from '@lucide/vue'

// Top-left menu: shows the open board, switches between boards and creates, renames or deletes them.
const { boards, currentId, current, open, create, rename, remove } = useBoards()
const isOpen = ref(false)

const ITEM_CLASS = 'flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm hover:bg-muted disabled:pointer-events-none disabled:opacity-40'

function run(action: () => unknown) {
  isOpen.value = false
  action()
}

function onRename() {
  const board = current.value
  if (!board) return
  const name = window.prompt('Neuer Name für das Board:', board.name)?.trim()
  if (name) rename(board.id, name)
}

function onDelete() {
  const board = current.value
  if (!board) return
  if (window.confirm(`Board „${board.name}“ und alle Objekte darauf wirklich löschen?`)) remove(board.id)
}
</script>

<template>
  <div class="fixed left-4 top-4 z-20">
    <button
      class="flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-medium shadow-md hover:bg-muted"
      @click="isOpen = !isOpen"
    >
      {{ current?.name ?? 'Board' }}
      <ChevronDown class="size-4" />
    </button>

    <!-- Invisible layer behind the menu: a click anywhere else closes it. -->
    <div v-if="isOpen" class="fixed inset-0" @click="isOpen = false" />

    <div v-if="isOpen" class="relative mt-2 w-64 rounded-xl border bg-white p-1 shadow-xl">
      <button v-for="board in boards" :key="board.id" :class="ITEM_CLASS" @click="run(() => open(board.id))">
        <span class="flex-1 truncate">{{ board.name }}</span>
        <Check v-if="board.id === currentId" class="size-4" />
      </button>
      <div class="my-1 h-px bg-border" />
      <button :class="ITEM_CLASS" @click="run(create)">
        <Plus class="size-4" /> Neues Board
      </button>
      <button :class="ITEM_CLASS" @click="run(onRename)">
        <Pencil class="size-4" /> Umbenennen
      </button>
      <button :class="ITEM_CLASS" :disabled="boards.length <= 1" @click="run(onDelete)">
        <Trash2 class="size-4" /> Löschen
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import type { BoardObjectType, Corner, Rect } from '~/models/board-object'
import StickyNote from '~/components/StickyNote.vue'
import TextBox from '~/components/TextBox.vue'
import CircleShape from '~/components/CircleShape.vue'

// Which component draws which variant.
const COMPONENTS: Record<BoardObjectType, Component> = {
  note: StickyNote,
  text: TextBox,
  circle: CircleShape,
}

const board = useBoard()
const canvas = useTemplateRef('canvas')
useShortcuts()

// New objects land in the middle of the current view.
function addObject(type: BoardObjectType, color?: string) {
  const center = canvas.value!.toWorld(window.innerWidth / 2, window.innerHeight / 2)
  board.select(board.addObject(type, center.x, center.y, color))
}
</script>

<template>
  <InfiniteCanvas ref="canvas" @pointerdown="board.select(null)">
    <component
      :is="COMPONENTS[object.type]"
      v-for="object in board.objects.value"
      :key="object.id"
      :object="object"
      :selected="object.id === board.selectedId.value"
      @select="board.select(object.id)"
      @move="(x: number, y: number) => board.moveObject(object.id, x, y)"
      @resize="(start: Rect, corner: Corner, dx: number, dy: number) => board.resizeObject(object.id, start, corner, dx, dy)"
      @text="(text: string) => board.setText(object.id, text)"
      @fit="(size: number) => board.growToFit(object.id, size)"
    />
    <ContextBar v-if="board.selected.value" :object="board.selected.value" />
  </InfiniteCanvas>
  <BoardToolbar @add="addObject" />
</template>

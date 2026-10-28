<script setup lang="ts">
const props = defineProps<{ text: string; editing: boolean; placeholder?: string }>()
const emit = defineEmits<{ input: [text: string]; stop: []; fit: [height: number] }>()

const textarea = useTemplateRef<HTMLTextAreaElement>('textarea')
const content = useTemplateRef<HTMLElement>('content')
let observer: ResizeObserver | undefined

// Reports the height the text needs, rounded up to the next grid line.
function fit() {
  const element = textarea.value ?? content.value
  if (element) emit('fit', Math.ceil(element.scrollHeight / GRID_SIZE) * GRID_SIZE)
}

// Re-measures whenever the visible element (textarea or text) changes size.
function observe() {
  observer?.disconnect()
  const element = textarea.value ?? content.value
  if (element) observer?.observe(element)
}

onMounted(() => {
  observer = new ResizeObserver(fit)
  observe()
})
onBeforeUnmount(() => observer?.disconnect())

watch(() => props.text, () => nextTick(fit))
watch(
  () => props.editing,
  async (editing) => {
    await nextTick()
    observe()
    if (!editing) return
    textarea.value?.focus()
    textarea.value?.select()
  },
)
</script>

<template>
  <textarea
    v-if="editing"
    ref="textarea"
    class="size-full resize-none bg-transparent outline-none"
    :value="text"
    :placeholder="placeholder"
    @input="emit('input', ($event.target as HTMLTextAreaElement).value)"
    @blur="emit('stop')"
    @keydown.escape="emit('stop')"
  />
  <div
    v-else
    ref="content"
    class="size-full overflow-hidden whitespace-pre-wrap break-words select-none"
    :class="!text && 'text-muted-foreground'"
  >{{ text || placeholder }}</div>
</template>

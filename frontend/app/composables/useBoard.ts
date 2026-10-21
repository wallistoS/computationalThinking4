export interface Note {
  id: string
  x: number
  y: number
  w: number
  h: number
  text: string
  color: string
}

export const NOTE_COLORS = ['#fef08a', '#fbcfe8', '#bbf7d0', '#bfdbfe', '#fed7aa'] as const

const NOTE_SIZE = 200

// Zentraler Zustand des Boards: alle Komponenten lesen und schreiben hier.
export function useBoard() {
  const notes = useState<Note[]>('notes', () => [])
  const selectedId = useState<string | null>('selectedId', () => null)
  const pan = useState('pan', () => ({ x: 0, y: 0 }))
  const zoom = useState('zoom', () => 1)

  const selectedNote = computed(() => notes.value.find((n) => n.id === selectedId.value))

  // Neues Post-it in der Mitte des sichtbaren Bereichs
  function addNote() {
    const note: Note = {
      id: crypto.randomUUID(),
      x: snap((window.innerWidth / 2 - pan.value.x) / zoom.value - NOTE_SIZE / 2),
      y: snap((window.innerHeight / 2 - pan.value.y) / zoom.value - NOTE_SIZE / 2),
      w: NOTE_SIZE,
      h: NOTE_SIZE,
      text: '',
      color: NOTE_COLORS[0]
    }
    notes.value.push(note)
    selectedId.value = note.id
  }

  return { notes, selectedId, selectedNote, pan, zoom, addNote }
}

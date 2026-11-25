export interface Board {
  id: string
  name: string
}

// The browser remembers the last opened board, so a reload opens it again.
const LAST_BOARD_KEY = 'lastBoardId'

function rememberBoard(id: string) {
  try {
    localStorage.setItem(LAST_BOARD_KEY, id)
  } catch {
    // Storage blocked: the app still works, it just opens the oldest board next time.
  }
}

function lastBoard() {
  try {
    return localStorage.getItem(LAST_BOARD_KEY)
  } catch {
    return null
  }
}

// Which boards exist and which one is open. Every change goes through the functions below.
export function useBoards() {
  const api = $fetch.create({ baseURL: useRuntimeConfig().public.apiBase })
  const boards = useState<Board[]>('boards', () => [])
  const currentId = useState<string | null>('currentBoardId', () => null)
  const current = computed(() => boards.value.find(board => board.id === currentId.value))

  function open(id: string) {
    currentId.value = id
    rememberBoard(id)
  }

  // Opens the last used board, or the oldest one if that board no longer exists.
  async function load() {
    boards.value = await api<Board[]>('/boards')
    const last = boards.value.find(board => board.id === lastBoard())
    const board = last ?? boards.value[0]
    if (board) open(board.id)
  }

  async function create() {
    const board = await api<Board>('/boards', { method: 'POST', body: { name: 'Neues Board' } })
    boards.value = [...boards.value, board]
    open(board.id)
  }

  async function rename(id: string, name: string) {
    const board = await api<Board>(`/boards/${id}`, { method: 'PATCH', body: { name } })
    boards.value = boards.value.map(existing => (existing.id === id ? board : existing))
  }

  // The last board cannot be deleted; the backend refuses it as well.
  async function remove(id: string) {
    if (boards.value.length <= 1) return
    await api(`/boards/${id}`, { method: 'DELETE' })
    boards.value = boards.value.filter(board => board.id !== id)
    if (currentId.value === id) open(boards.value[0]!.id)
  }

  return { boards: readonly(boards), currentId: readonly(currentId), current, load, open, create, rename, remove }
}

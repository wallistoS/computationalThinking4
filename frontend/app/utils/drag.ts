// Verfolgt eine Zieh-Bewegung ab einem pointerdown und meldet den Abstand zum Startpunkt.
export function startDrag(
  start: PointerEvent,
  onMove: (dx: number, dy: number, event: PointerEvent) => void,
  onEnd?: () => void
) {
  const move = (event: PointerEvent) =>
    onMove(event.clientX - start.clientX, event.clientY - start.clientY, event)
  const up = () => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', up)
    onEnd?.()
  }
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', up)
}

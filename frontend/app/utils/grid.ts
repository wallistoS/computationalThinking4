// Abstand der Punkte im Hintergrund-Raster (px)
export const GRID = 20

export const snap = (value: number) => Math.round(value / GRID) * GRID

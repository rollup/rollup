const win = typeof window !== 'undefined' ? window : {};
export const ExternalElement = win.HTMLElement || class {};

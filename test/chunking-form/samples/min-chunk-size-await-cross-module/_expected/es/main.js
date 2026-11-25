import { p as preload } from './generated-preload.js';

globalThis.p = preload(() => import('./generated-entry.js'));

await globalThis.p;

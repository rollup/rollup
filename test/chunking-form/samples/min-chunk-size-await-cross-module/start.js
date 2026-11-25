import { preload } from './preload.js';
globalThis.p = preload(() => import('./entry.js'));

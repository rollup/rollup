import { preload } from './preload.js';

await preload(() => import('./entry.js'));

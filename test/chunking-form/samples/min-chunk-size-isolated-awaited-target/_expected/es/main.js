import { p as preload } from './generated-preload.js';

await preload(() => import('./generated-entry.js'));

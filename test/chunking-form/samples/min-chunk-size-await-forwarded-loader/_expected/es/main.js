import { p as preload } from './generated-preload.js';

const load = () => import('./generated-entry.js');

await preload(load);

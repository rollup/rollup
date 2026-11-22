import { p as preload } from './generated-app.js';

await preload(() => import('./generated-entry.js'));

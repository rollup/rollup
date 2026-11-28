import { p as preload } from './generated-app.js';

await preload(() => import('./entry.js'));

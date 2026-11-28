import { preload } from './preload.js';

preload(() => import('./app.js')).then(({ default: App }) => console.log(App()));

import { p as preload } from './generated-preload.js';

preload(() => import('./main.js').then(function (n) { return n.a; })).then(({ default: App }) => console.log(App()));

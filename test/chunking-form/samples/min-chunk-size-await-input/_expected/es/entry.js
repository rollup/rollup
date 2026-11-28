import { p as preload } from './generated-app.js';

preload(() => import('./generated-app.js').then(function (n) { return n.a; })).then(({ default: App }) => console.log(App()));

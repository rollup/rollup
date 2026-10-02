import { a } from './generated-manual.js';

import('./generated-manual.js').then(function (n) { return n.m; }).then(n => console.log(n.b, a));

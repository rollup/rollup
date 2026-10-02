import { m } from './generated-manual.js';

import('./generated-manual.js').then(function (n) { return n.x; }).then(n => console.log(n.x, m));

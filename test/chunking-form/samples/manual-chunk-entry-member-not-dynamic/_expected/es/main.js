const X = 'x';

import('./generated-manual.js').then(function (n) { return n.m; }).then(m => console.log(m.MB, m.OTHER, X));

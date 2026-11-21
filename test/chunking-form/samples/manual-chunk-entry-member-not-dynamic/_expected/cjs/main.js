'use strict';

const X = 'x';

Promise.resolve().then(function () { return require('./generated-manual.js'); }).then(function (n) { return n.mB; }).then(m => console.log(m.MB, m.OTHER, X));

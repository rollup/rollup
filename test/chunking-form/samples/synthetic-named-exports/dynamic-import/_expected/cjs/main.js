'use strict';

Promise.resolve().then(function () { return require('./generated-dep.js'); }).then(function (n) { return n.dep; }).then(({ foo, bar, baz }) => console.log(foo, bar, baz));

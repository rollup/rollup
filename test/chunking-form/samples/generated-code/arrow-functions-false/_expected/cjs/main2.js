'use strict';

Promise.resolve().then(function () { return require('./generated-dep1.js'); }).then(function (n) { return n.dep1; }).then(console.log);

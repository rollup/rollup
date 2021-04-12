'use strict';

Promise.resolve().then(function () { return require('./generated-first.js'); });
Promise.resolve().then(function () { return require('./generated-second.js'); }).then(function (n) { return n.b; });
Promise.resolve().then(function () { return require('./generated-second.js'); }).then(function (n) { return n.c; });

'use strict';

Promise.resolve().then(function () { return require('./generated-lib.js'); }).then(function (n) { return n.lib; });

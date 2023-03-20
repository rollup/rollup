'use strict';

Promise.resolve().then(function () { return require('./lib.js'); }).then(function (n) { return n.lib; }).then(console.log);

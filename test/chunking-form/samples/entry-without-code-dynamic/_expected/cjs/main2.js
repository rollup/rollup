'use strict';

Promise.resolve().then(function () { return require('./generated-dynamic.js'); }).then(console.log);

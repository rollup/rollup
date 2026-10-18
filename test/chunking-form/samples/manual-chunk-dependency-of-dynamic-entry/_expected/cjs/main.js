'use strict';

console.log(Promise.resolve().then(function () { return require('./generated-dynamic.js'); }));

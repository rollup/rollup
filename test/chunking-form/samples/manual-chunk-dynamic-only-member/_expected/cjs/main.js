'use strict';

Promise.resolve().then(function () { return require('./generated-manual.js'); }).then(n => console.log(n.a));

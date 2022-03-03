'use strict';

Promise.resolve().then(function () { return require('./generated-foo.js'); }).then(console.log);

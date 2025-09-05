'use strict';

Promise.resolve().then(function () { return require('./generated-dynamic.js'); }).then(result => console.log(result));
Promise.resolve().then(function () { return require('./generated-dynamic2.js'); }).then(result => console.log(result));

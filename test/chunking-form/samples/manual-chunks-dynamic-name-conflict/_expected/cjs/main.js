'use strict';

Promise.resolve().then(function () { return require('./generated-dynamic.js'); }).then(function (n) { return n.dynamic1; }).then(result => console.log(result));
Promise.resolve().then(function () { return require('./generated-dynamic.js'); }).then(function (n) { return n.dynamic2; }).then(result => console.log(result));

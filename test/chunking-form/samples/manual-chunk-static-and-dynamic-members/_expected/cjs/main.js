'use strict';

var manual = require('./generated-manual.js');

Promise.resolve().then(function () { return require('./generated-manual.js'); }).then(function (n) { return n.mB; }).then(n => console.log(n.b, manual.a));

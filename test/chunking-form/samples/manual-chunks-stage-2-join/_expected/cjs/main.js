'use strict';

var manual = require('./generated-manual.js');

Promise.resolve().then(function () { return require('./generated-manual.js'); }).then(function (n) { return n.x; }).then(n => console.log(n.x, manual.m));

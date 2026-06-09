'use strict';

var b = require('./generated-b.js');

const c = 'c';
console.log(c);

const a = 'a';
console.log(a + b.b);

exports.a = a;
exports.c = c;

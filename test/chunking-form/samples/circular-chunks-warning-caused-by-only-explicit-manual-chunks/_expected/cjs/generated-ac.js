'use strict';

var main = require('./main.js');

const c = 'c';
console.log(c);

const a = 'a';
console.log(a + main.b);

exports.a = a;
exports.c = c;

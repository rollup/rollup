'use strict';

var ac = require('./generated-ac.js');
require('./main.js');

const b = 'b';
console.log(b + ac.c);

console.log(ac.a);

exports.b = b;

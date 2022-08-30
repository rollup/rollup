'use strict';

const PRINT = x => console.log(x);

var C = 123;

PRINT(C);

exports.print = PRINT;
exports.value = C;

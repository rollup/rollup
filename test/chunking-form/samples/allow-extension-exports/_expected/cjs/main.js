'use strict';

var libs = require('./generated-lib1.js');

console.log(libs.value1);
console.log(libs.value1$1);
console.log(libs.value2);
console.log(Promise.resolve().then(function () { return require('./generated-lib1.js'); }).then(function (n) { return n.lib3; }).then(m => m.value3));

'use strict';

var libs = require('./generated-lib1.js');
var vendor = require('./generated-vendor.js');

console.log(libs.value1);
console.log(vendor.bar);
console.log(libs.value2);
console.log(vendor.bar);

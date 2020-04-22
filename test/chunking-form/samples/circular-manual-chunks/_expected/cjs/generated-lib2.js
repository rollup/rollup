'use strict';

var lib1 = require('./generated-lib1.js');

const lib2 = 'lib2';
console.log(`${lib2} imports ${lib1.lib1}`);

exports.lib2 = lib2;

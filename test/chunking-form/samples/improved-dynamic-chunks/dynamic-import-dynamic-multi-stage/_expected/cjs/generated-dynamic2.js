'use strict';

var main = require('./main.js');

console.log('dynamic2', main.value);

exports.value = main.value;

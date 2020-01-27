'use strict';

var main = require('./main.js');

console.log('dynamic', main.value);

exports.value = main.value;

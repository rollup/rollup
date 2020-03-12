'use strict';

var dynamic1 = require('./generated-dynamic1.js');

console.log('dynamic2', dynamic1.value);

exports.value = dynamic1.value;

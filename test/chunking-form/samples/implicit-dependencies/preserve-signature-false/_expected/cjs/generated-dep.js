'use strict';

const value = 42;

console.log(value);
Promise.resolve().then(function () { return require('./generated-dynamicDep.js'); });

exports.value = value;

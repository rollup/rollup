'use strict';

var value = 42;

const promise = Promise.resolve().then(function () { return require('./generated-dynamic.js'); }).then(result => console.log('main', result, value));

exports.promise = promise;
exports.value = value;

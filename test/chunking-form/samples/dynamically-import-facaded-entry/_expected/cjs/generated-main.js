'use strict';

var value = 42;

const promise = new Promise(function (resolve) { resolve(require('./generated-dynamic.js')); }).then(result => console.log('main', result, value));

exports.promise = promise;
exports.value = value;

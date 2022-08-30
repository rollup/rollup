'use strict';

const separate = Promise.resolve().then(function () { return require('./generated-separate.js'); });

exports.separate = separate;

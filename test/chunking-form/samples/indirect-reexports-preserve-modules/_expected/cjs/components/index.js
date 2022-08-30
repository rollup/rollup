'use strict';

var index = require('./sub/index.js');

const baz = { bar: index.default };

exports.foo = index.foo;
exports.baz = baz;

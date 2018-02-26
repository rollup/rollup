'use strict';

var ___freeGlobal_js = require('./_freeGlobal.js');

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = ___freeGlobal_js.default || freeSelf || Function('return this')();

module.exports = root;

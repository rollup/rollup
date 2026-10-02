'use strict';

var shared = require('./generated-shared.js');

const exclusive = 'exclusive';

const m = shared.shared + exclusive;

exports.m = m;

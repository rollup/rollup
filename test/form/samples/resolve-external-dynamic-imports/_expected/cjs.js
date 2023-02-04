'use strict';

var myExternal = require('external');

const test = () => myExternal;

const someDynamicImport = () => import('external');

exports.someDynamicImport = someDynamicImport;
exports.test = test;

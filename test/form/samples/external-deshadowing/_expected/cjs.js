'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var a = require('a');
var Test$1 = require('b');

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

Test$1 = _interopDefault(Test$1);

const Test = () => {
  console.log(a.Test);
};

const Test1 = () => {
  console.log(Test$1);
};

exports.Test = Test;
exports.Test1 = Test1;

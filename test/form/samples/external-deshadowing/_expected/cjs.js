'use strict';

var a = require('a');
var Test$1 = require('b');

const Test = () => {
  console.log(a.Test);
};

const Test1 = () => {
  console.log(Test$1);
};

exports.Test = Test;
exports.Test1 = Test1;

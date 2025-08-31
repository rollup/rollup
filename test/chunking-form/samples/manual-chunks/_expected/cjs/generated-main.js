'use strict';

var deps2and3 = require('./generated-deps2and3.js');

function fn$1 () {
  console.log('dep1 fn');
}

function fn () {
  console.log('lib2 fn');
}

class Main {
  constructor () {
    fn$1();
    deps2and3.fn();
    deps2and3.fn$1();
  }
}

exports.Main = Main;
exports.fn = fn;

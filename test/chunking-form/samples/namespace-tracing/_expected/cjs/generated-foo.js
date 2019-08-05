'use strict';

require('./generated-broken.js');

function foo() {
  console.log('foo');
}

exports.foo = foo;

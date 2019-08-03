'use strict';

require('./generated-broken.js');

function bar() {
  console.log('bar');
}

exports.bar = bar;

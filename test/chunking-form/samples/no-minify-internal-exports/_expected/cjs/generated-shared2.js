'use strict';

const shared1 = 'shared1';
const foo$1 = 'foo1';

var shared2 = 'shared2';
const foo = 'foo2';

exports.foo = foo$1;
exports.foo$1 = foo;
exports.shared1 = shared1;
exports.shared2 = shared2;

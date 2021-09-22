'use strict';

const foo = 'dep2';
Promise.resolve().then(function () { return dep1; }).then(console.log);

const bar = 'dep1' + foo;

var dep1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	bar: bar
});

exports.bar = bar;
exports.dep1 = dep1;
exports.foo = foo;

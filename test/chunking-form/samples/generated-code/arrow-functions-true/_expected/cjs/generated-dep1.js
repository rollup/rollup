'use strict';

const foo = 'dep2';
Promise.resolve().then(() => dep1).then(console.log);

const bar = 'dep1' + foo;

var dep1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({
	bar: bar
}, null));

exports.bar = bar;
exports.dep1 = dep1;
exports.foo = foo;

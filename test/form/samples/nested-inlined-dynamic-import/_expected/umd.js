(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
})((function () { 'use strict';

	async function main() {
		const foo$1 = 1;
		const ns = await Promise.resolve().then(function () { return foo; });
		console.log(ns.value + foo$1);
	}

	main();

	const value = 42;

	var foo = /*#__PURE__*/Object.freeze({
		__proto__: null,
		value: value
	});

}));

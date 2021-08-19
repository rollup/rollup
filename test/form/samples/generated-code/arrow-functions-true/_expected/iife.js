var bundle = ((exports, external) => {
	'use strict';

	exports.a = void 0;

	({a: exports.a} = external.b);
	console.log({a: exports.a} = external.b);

	import('external').then(console.log);

	Object.defineProperty(exports, 'foo', {
		enumerable: true,
		get: () => external.foo
	});
	Object.keys(external).forEach(k => {
		if (k !== 'default' && !exports.hasOwnProperty(k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: () => external[k]
		});
	});

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

})({}, external);

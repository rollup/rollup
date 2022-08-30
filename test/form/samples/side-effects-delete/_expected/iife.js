var myBundle = (function (exports) {
	'use strict';

	var x = {foo: 'bar'};
	delete x.foo;

	delete globalThis.unknown.foo;

	exports.x = x;

	return exports;

})({});

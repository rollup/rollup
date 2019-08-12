var bundle = (function (exports) {
	'use strict';

	function foo () {}
	foo = 1;

	class bar {}
	bar = 1;

	exports.bar = bar;
	exports.foo = foo;

	return exports;

}({}));

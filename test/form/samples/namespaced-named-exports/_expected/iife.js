this.foo = this.foo || {};
this.foo.bar = this.foo.bar || {};
this.foo.bar.baz = (function (exports) {
	'use strict';

	var answer = 42;

	exports.answer = answer;

	return exports;

})({});

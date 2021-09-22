this.foo = this.foo || {};
this.foo.bar = this.foo.bar || {};
(function (exports) {
	'use strict';

	const answer = 42;

	exports.answer = answer;

	Object.defineProperty(exports, '__esModule', { value: true });

})(this.foo.bar.baz = this.foo.bar.baz || {});

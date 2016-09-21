(function (exports) {
	'use strict';

	var foo;

	bar();

	function bar() {
		globalSideEffect = true;
	}

	exports.foo = foo;

}((this.bundle = this.bundle || {})));

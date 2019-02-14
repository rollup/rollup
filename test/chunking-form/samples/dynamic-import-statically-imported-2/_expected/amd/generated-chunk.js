define(['require', 'exports'], function (require, exports) { 'use strict';

	function foo() {
		return 'dep2';
	}

	Promise.resolve().then(function () { return dep1; }).then(({ bar }) => console.log(bar()));

	function bar() {
		return foo();
	}

	var dep1 = /*#__PURE__*/Object.freeze({
		bar: bar
	});

	exports.foo = foo;
	exports.bar = bar;

});

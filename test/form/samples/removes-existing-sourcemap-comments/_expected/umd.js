(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}(typeof self !== 'undefined' ? self : this, function () { 'use strict';

	function foo () {
		return 42;
	}

	var str = `
//# sourceMappingURL=main.js.map
`;

	console.log( foo(str) );

}));

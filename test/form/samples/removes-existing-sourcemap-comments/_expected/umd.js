(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}((function () { 'use strict';

	function foo (x) {
		return x;
	}

	var str = `
//# sourceMappingURL=main.js.map
`;

	console.log( foo(str) );

})));

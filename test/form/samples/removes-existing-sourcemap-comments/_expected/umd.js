(function (global, factory) {
	typeof module === 'object' && module.exports ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	function foo () {
		return 42;
	}

	var str = `
//# sourceMappingURL=main.js.map
`;

	console.log( foo(str) );

})));

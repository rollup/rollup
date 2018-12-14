(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}(function () { 'use strict';

	function foo () {
		return 42;
	}

	var str = `
//# sourceMappingURL=main.js.map
`;

	console.log( foo(str) );

}));

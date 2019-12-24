(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}((function () { 'use strict';

	function foo () {
		console.log( 'hello from foo.js' );
	}

	function bar () {
		console.log( 'hello from bar.js' );
	}

	console.log( 'hello from main.js' );

	foo();
	bar();

})));
//# sourceMappingURL=umd.js.map

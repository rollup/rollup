(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}(this, function () { 'use strict';

	console.log( 'hello from main.js' );

	function foo () {
		console.log( 'hello from foo.js' );
	}

	foo();
	function bar () {
		console.log( 'hello from bar.js' );
	}
	bar();

}));
//# sourceMappingURL=umd.js.map

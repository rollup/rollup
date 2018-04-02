(function (global, factory) {
	typeof module === 'object' && module.exports ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	function foo ( x ) {
		effect( x );
		if ( x > 0 ) foo( x - 1 );
	}

	function bar ( x ) {
		effect( x );
		if ( x > 0 ) baz( x );
	}

	function baz ( x ) {
		bar( x - 1 );
	}

	foo( 10 );
	bar( 10 );

})));

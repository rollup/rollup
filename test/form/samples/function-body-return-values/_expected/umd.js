(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	function retained1 () {
		return () => console.log( 'effect' );
	}

	retained1()();

	function retained2 () {
		if ( globalCondition ) {
			return () => console.log( 'effect' );
		}
		return () => {};
	}

	retained2()();

	function retained3 () {
		if ( globalCondition ) {
			return () => {};
		}
	}

	retained3()();

	function retained4 () {}

	retained4()();

	function retained5 () {
		return {};
	}

	retained5().x.y = 1;

	function retained6 () {
		return { x: () => console.log('effect') };
	}

	retained6().x();

})));

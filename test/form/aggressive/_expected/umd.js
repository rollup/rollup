(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}(this, function () { 'use strict';

	function foo () {
		return 42;
	}

	foo.property = "Foo";

	assert.equal( foo(), 42 );
	assert.equal( foo.property, "Foo" );

}));
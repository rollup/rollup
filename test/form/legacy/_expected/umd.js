(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	const foo = 42;


	var namespace = (Object.freeze || Object)({
		'foo': foo
	});

	const x = 'foo';
	assert.equal( namespace[x], 42 );

})));

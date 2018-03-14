(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	const _typeof = 'typeof';
	const foo = 1;

	var namespace = /*#__PURE__*/(Object.freeze || Object)({
		'typeof': _typeof,
		foo: foo
	});

	console.log( namespace );

})));

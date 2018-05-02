(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	var nested = {"specialConfig":1};

	{
		console.log('production');
	}

	if (nested.specialConfig !== 1) {
		console.log('Nested data is not removed as long rollup-plugin-json creates "Literal" instead of "ObjectExpression" nodes');
	}

})));

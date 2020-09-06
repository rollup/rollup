define(['exports', './generated-dep', 'external'], function (exports, dep, external) { 'use strict';

	console.log(external.reexported);

	var lib = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
		__proto__: null,
		reexported: dep.reexported
	}, '__esModule', { value: true }));

	exports.lib = lib;

});

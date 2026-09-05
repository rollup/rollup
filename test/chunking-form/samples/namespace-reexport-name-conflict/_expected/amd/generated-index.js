define(['exports', './generated-dep', 'external'], (function (exports, dep, external) { 'use strict';

	console.log(external.reexported);

	var lib = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({
		reexported: dep.reexported
	}, null));

	exports.lib = lib;

}));

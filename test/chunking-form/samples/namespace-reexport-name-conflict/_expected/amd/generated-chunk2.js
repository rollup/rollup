define(['exports', './generated-chunk', 'external'], function (exports, dep, external) { 'use strict';

	console.log(external.reexported);

	var lib = /*#__PURE__*/Object.freeze({
		reexported: dep.reexported
	});

	exports.lib = lib;

});

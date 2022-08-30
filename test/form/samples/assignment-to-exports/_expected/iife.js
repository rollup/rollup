var bundle = (function (exports) {
	'use strict';

	// Unassigned export
	var foo1;

	// Reassigned uninitialised export
	exports.bar1 = 1;
	exports.bar1 = void 0;

	// Reassigned initialised export
	exports.baz1 = 1;
	exports.baz1 = 2;

	// Unassigned export
	var kept1, foo2, kept2;

	// Reassigned uninitialised export
	var kept1; exports.bar2 = void 0; var kept2;
	exports.bar2 = 1;

	// Reassigned initialised export
	var kept1; exports.baz2 = 1; var kept2;
	exports.baz2 = 2;

	console.log( kept1, kept2 );

	exports.foo1 = foo1;
	exports.foo2 = foo2;

	return exports;

})({});

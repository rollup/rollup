var foo = (function (a) {
	'use strict';

	/* this is an intro */
	var a__default = 'default' in a ? a['default'] : a;

	console.log( a__default );
	console.log( a.b );

	var main = 42;

	return main;
	/* this is an outro */

}(a));

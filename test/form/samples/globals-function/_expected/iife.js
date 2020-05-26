(function (a, b) {
	'use strict';

	a = a && Object.prototype.hasOwnProperty.call(a, 'default') ? a['default'] : a;
	b = b && Object.prototype.hasOwnProperty.call(b, 'default') ? b['default'] : b;

	console.log(a, b);

}(thisIsA, thisIsB));

define(['external1', 'external2'], function (external1, external2) { 'use strict';

	external2 = external2 && external2.hasOwnProperty('default') ? external2['default'] : external2;

	console.log(external1.foo);

	return external2;

});

define(['external1', 'external2'], function (external1, external2) { 'use strict';

	function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

	external2 = _interopDefault(external2);

	console.log(external1.foo);

	return external2;

});

define(['exports', 'lib'], function (exports, value) { 'use strict';

	value = value && Object.prototype.hasOwnProperty.call(value, 'default') ? value['default'] : value;

	var dep = 2 * value;

	exports.dep = dep;

});

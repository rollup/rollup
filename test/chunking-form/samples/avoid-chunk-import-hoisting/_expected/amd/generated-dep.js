define(['exports', 'lib'], function (exports, value) { 'use strict';

	value = value && value.hasOwnProperty('default') ? value['default'] : value;

	var dep = 2 * value;

	exports.dep = dep;

});

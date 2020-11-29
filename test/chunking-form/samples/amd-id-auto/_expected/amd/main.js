define('main', ['require', 'exports'], function (require, exports) { 'use strict';

	function getA() {
		return new Promise(function (resolve, reject) { require(['./generated-a'], resolve, reject) });
	}

	exports.getA = getA;

	Object.defineProperty(exports, '__esModule', { value: true });

});

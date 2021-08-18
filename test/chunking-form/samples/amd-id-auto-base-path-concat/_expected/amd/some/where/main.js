define('some/where/main', ['require', 'exports'], (function (require, exports) { 'use strict';

	function getA() {
		return new Promise(function (resolve, reject) { require(['./generated-a'], resolve, reject); });
	}

	exports.getA = getA;

	Object.defineProperty(exports, '__esModule', { value: true });

}));

define('some/where/generated-a', ['exports'], (function (exports) { 'use strict';

	const something = 42;

	exports.something = something;

}));

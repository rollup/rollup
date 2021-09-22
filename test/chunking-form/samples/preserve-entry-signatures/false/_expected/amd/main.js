define(['require', 'exports'], (function (require, exports) { 'use strict';

	const shared = 'shared';

	new Promise(function (resolve, reject) { require(['./generated-dynamic'], resolve, reject); });

	globalThis.sharedStatic = shared;

	exports.shared = shared;

	Object.defineProperty(exports, '__esModule', { value: true });

}));

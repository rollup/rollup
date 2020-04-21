define(['require', 'exports'], function (require, exports) { 'use strict';

	const shared = 'shared';

	const dynamic = new Promise(function (resolve, reject) { require(['./generated-dynamic'], resolve, reject) });

	globalThis.sharedStatic = shared;

	exports.shared = shared;

	Object.defineProperty(exports, '__esModule', { value: true });

});

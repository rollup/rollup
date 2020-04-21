define(['require', 'exports'], function (require, exports) { 'use strict';

	const shared = 'shared';

	const unused = 'unused';
	const dynamic = new Promise(function (resolve, reject) { require(['./generated-dynamic'], resolve, reject) });

	globalThis.sharedStatic = shared;

	exports.dynamic = dynamic;
	exports.shared = shared;
	exports.unused = unused;

});

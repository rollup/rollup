define(['require', 'exports'], function (require, exports) { 'use strict';

	const shared = 'shared';

	const nonEssential = 'non-essential';
	const dynamic = new Promise(function (resolve, reject) { require(['./generated-dynamic'], resolve, reject) });

	globalThis.sharedStatic = shared;

	exports.dynamic = dynamic;
	exports.nonEssential = nonEssential;
	exports.shared = shared;

});

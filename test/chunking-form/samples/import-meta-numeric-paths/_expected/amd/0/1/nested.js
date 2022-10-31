define(['module', 'exports'], (function (module, exports) { 'use strict';

	const url = new URL(module.uri, document.baseURI).href;

	exports.url = url;

}));

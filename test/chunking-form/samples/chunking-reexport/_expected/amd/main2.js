define(['exports', './main1', 'external'], (function (exports, main1, external) { 'use strict';



	Object.defineProperty(exports, 'dep', {
		enumerable: true,
		get: function () { return external.asdf; }
	});

}));

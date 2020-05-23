define(['require', 'exports'], function (require, exports) { 'use strict';

	const lib = { named: { named: 42 } };

	console.log('side-effect', lib.named);

	console.log('side-effect', lib.named.named);

	const component = new Promise(function (resolve, reject) { require(['./generated-component'], resolve, reject) });

	exports.component = component;
	exports.lib = lib;
	exports.named = lib.named.named;

});

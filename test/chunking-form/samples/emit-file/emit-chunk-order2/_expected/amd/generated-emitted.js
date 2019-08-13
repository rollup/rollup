define(['exports', './generated-dep'], function (exports, dep) { 'use strict';

	const id = 'emitted';
	console.log(id, dep.value);

	exports.id = id;

	Object.defineProperty(exports, '__esModule', { value: true });

});

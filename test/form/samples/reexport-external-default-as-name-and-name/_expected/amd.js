define(['exports', 'external'], (function (exports, external) { 'use strict';

	console.log(external.value);

	exports.reexported = external;

	Object.defineProperty(exports, '__esModule', { value: true });

}));

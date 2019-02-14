define(['exports'], function (exports) { 'use strict';

	const localIsNan = isNan;

	const isNaN = localIsNan;

	exports.isNaN = isNaN;

	Object.defineProperty(exports, '__esModule', { value: true });

});

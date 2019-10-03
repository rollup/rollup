define(['exports', './answer.num', './lorem.str', './no-ext'], function (exports, answer, lorem, noExt) { 'use strict';



	exports.answer = answer.default;
	exports.lorem = lorem.default;
	exports.noExt = noExt.default;

	Object.defineProperty(exports, '__esModule', { value: true });

});

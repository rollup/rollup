define(['exports', './generated-dep'], (function (exports, dep) { 'use strict';

	console.log('main2', dep.value);

	exports.reexported = dep.value;

}));

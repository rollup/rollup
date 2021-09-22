define(['exports', './generated-lib1'], (function (exports, lib1) { 'use strict';

	const lib2 = 'lib2';
	console.log(`${lib2} imports ${lib1.lib1}`);

	exports.lib2 = lib2;

}));

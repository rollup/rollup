define(['exports', './generated-lib2'], function (exports, lib2) { 'use strict';

	const lib1 = 'lib1';
	console.log(`${lib1} imports ${lib2.lib2}`);

	exports.lib1 = lib1;

});

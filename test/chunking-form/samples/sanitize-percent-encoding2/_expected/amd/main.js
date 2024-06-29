define(['require', 'exports'], (function (require, exports) { 'use strict';

	const lazy1 = new Promise(function (resolve, reject) { require(['./generated-foo_20bar'], resolve, reject); });
	const lazy2 = new Promise(function (resolve, reject) { require(['./generated-foo_bar'], resolve, reject); });
	const lazy3 = new Promise(function (resolve, reject) { require(['./generated-foo_E3_81_82bar'], resolve, reject); });
	const lazy4 = new Promise(function (resolve, reject) { require(['./generated-foo_E3_81bar'], resolve, reject); });

	exports.lazy1 = lazy1;
	exports.lazy2 = lazy2;
	exports.lazy3 = lazy3;
	exports.lazy4 = lazy4;

}));

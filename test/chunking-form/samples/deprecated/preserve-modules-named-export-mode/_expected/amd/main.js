define(['require', 'exports', './default', './named'], function (require, exports, _default, named) { 'use strict';

	console.log(_default['default'], named.value);

	new Promise(function (resolve, reject) { require(['./default'], resolve, reject) }).then(result => console.log(result.default));
	new Promise(function (resolve, reject) { require(['./named'], resolve, reject) }).then(result => console.log(result.value));

	exports.default = _default['default'];

	Object.defineProperty(exports, '__esModule', { value: true });

});

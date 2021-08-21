define(['require', './default', './named'], (function (require, _default, named) { 'use strict';

	function _interopNamespaceDefaultOnly (e) { return Object.freeze({ __proto__: null, 'default': e }); }

	console.log(_default, named.value);

	new Promise(function (resolve, reject) { require(['./default'], function (m) { resolve(/*#__PURE__*/_interopNamespaceDefaultOnly(m)); }, reject); }).then(result => console.log(result.default));
	new Promise(function (resolve, reject) { require(['./named'], resolve, reject); }).then(result => console.log(result.value));

	return _default;

}));

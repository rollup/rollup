(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('unchanged'), require('changed'), require('special-character'), require('with/slash'), require('./relative.js')) :
	typeof define === 'function' && define.amd ? define(['unchanged', 'changed', 'special-character', 'with/slash', './relative.js'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.unchanged, global.changedName, global.specialCharacter, global.slash, global.relative_js));
}(this, (function (unchanged, changedName, specialCharacter, slash, relative_js) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

	var changedName__default = /*#__PURE__*/_interopDefaultLegacy(changedName);

	console.log(unchanged.foo, changedName__default['default'], specialCharacter.bar, slash.baz, relative_js.quux);

})));

define(['external-all', 'external-default', 'external-default-named', 'external-default-namespace'], function (foo, bar, baz, quux) { 'use strict';

	function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex : { 'default': ex }; }

	var foo__default = /*#__PURE__*/_interopDefault(foo);
	var bar__default = /*#__PURE__*/_interopDefault(bar);
	var baz__default = /*#__PURE__*/_interopDefault(baz);
	var quux__default = /*#__PURE__*/_interopDefault(quux);

	console.log(foo__default['default'], bar__default['default'], baz__default['default'], quux__default['default']);

});

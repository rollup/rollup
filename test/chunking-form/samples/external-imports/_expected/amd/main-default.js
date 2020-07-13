define(['external-all', 'external-default', 'external-default-named', 'external-default-namespace'], function (foo, bar, baz, quux) { 'use strict';

	function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex : { 'default': ex }; }

	var foo__default = _interopDefault(foo);
	var bar__default = _interopDefault(bar);
	var baz__default = _interopDefault(baz);
	var quux__default = _interopDefault(quux);

	console.log(foo__default['default'], bar__default['default'], baz__default['default'], quux__default['default']);

});

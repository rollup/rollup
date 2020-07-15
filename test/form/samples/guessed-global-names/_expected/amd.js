define(['unchanged', 'changed', 'special-character', 'with/slash', './relative'], function (unchanged, changedName, specialCharacter, slash, relative_js) { 'use strict';

	function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex : { 'default': ex }; }

	var changedName__default = /*#__PURE__*/_interopDefault(changedName);

	console.log(unchanged.foo, changedName__default['default'], specialCharacter.bar, slash.baz, relative_js.quux);

});

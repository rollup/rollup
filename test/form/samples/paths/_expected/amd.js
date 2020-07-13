define(['https://unpkg.com/foo'], function (foo) { 'use strict';

	function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex : { 'default': ex }; }

	var foo__default = _interopDefault(foo);

	assert.equal( foo__default['default'], 42 );

});

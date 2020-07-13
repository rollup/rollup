(function (foo) {
	'use strict';

	function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex : { 'default': ex }; }

	var foo__default = _interopDefault(foo);

	assert.equal(foo__default['default'], 42);

	import('https://unpkg.com/foo').then(({ default: foo }) => assert.equal(foo, 42));

}(foo));

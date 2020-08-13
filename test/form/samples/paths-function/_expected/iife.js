(function (foo) {
	'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

	var foo__default = /*#__PURE__*/_interopDefaultLegacy(foo);

	assert.equal(foo__default['default'], 42);

	import('https://unpkg.com/foo').then(({ default: foo }) => assert.equal(foo, 42));

}(foo));

(function (factory, baz, containers, alphabet) {
	'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

	var factory__default = /*#__PURE__*/_interopDefaultLegacy(factory);
	var alphabet__default = /*#__PURE__*/_interopDefaultLegacy(alphabet);

	factory__default['default']( null );
	baz.foo( baz.bar, containers.port );
	containers.forEach( console.log, console );
	console.log( alphabet.a );
	console.log( alphabet__default['default'].length );

}(factory, baz, containers, alphabet));

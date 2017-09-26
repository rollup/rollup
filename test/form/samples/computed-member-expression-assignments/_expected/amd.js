define(function () { 'use strict';

	const retained1 = { foo: {} };
	retained1[ 'f' + 'oo' ] = globalVar;
	retained1.foo.bar = 1;

	const retained2 = {};
	retained2[ 'f' + 'oo' ].bar = 1;

	const retained3 = { foo: globalVar };
	retained3.foo[ 'b' + 'ar' ] = 1;

	const retained4 = { foo: () => {} };
	retained4[ 'f' + 'oo' ] = function () {this.x = 1;};
	retained4.foo();

	const retained5 = { foo: function () {this.x = 1;} };
	retained5[ 'f' + 'oo' ]();

});

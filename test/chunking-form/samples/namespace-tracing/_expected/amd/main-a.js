define(['./generated-foo', './generated-broken'], function (foo, broken) { 'use strict';

	foo.foo();
	broken.broken();

});

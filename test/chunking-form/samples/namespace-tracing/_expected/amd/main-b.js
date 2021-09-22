define(['./generated-foo', './generated-bar', './generated-broken'], (function (foo, bar, broken) { 'use strict';

	foo.foo();
	broken.broken();
	bar.bar();
	broken.broken();

}));

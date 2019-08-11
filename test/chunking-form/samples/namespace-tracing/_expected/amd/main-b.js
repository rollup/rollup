define(['./generated-broken', './generated-foo', './generated-bar'], function (broken, foo, bar) { 'use strict';

	foo.foo();
	broken.broken();
	bar.bar();
	broken.broken();

});

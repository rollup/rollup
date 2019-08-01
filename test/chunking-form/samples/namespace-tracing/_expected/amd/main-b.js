define(['./generated-chunk', './generated-chunk2', './generated-chunk3'], function (broken, foo, bar) { 'use strict';

	foo.foo();
	broken.broken();
	bar.bar();
	broken.broken();

});

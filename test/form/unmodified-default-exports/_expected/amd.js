define(function () { 'use strict';

	var Foo = function () {
		this.isFoo = true;
	};

	Foo.prototype = {
		answer: function () {
			return 42;
		}
	};

	var foo = new Foo();

});

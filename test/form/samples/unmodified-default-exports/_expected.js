var Foo = function () {
	console.log( 'side effect' );
	this.isFoo = true;
};

Foo.prototype = {
	answer: function () {
		return 42;
	}
};

new Foo();

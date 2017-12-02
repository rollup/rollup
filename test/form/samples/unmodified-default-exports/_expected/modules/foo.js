var Foo = function () {
	console.log( 'side effect' );
	this.isFoo = true;
};

export default Foo;

Foo.prototype = {
	answer: function () {
		return 42;
	}
};

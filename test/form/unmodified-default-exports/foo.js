var Foo = function () {
	this.isFoo = true;
};

export default Foo;

Foo.prototype = {
	answer: function () {
		return 42;
	}
};

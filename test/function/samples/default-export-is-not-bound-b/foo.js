var Foo = function () {
	this.bar = bar();
}

export default Foo;
Foo = 'something else';

function bar() {
	return 42;
}

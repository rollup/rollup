function fooDecorator$1() {
	console.log('first effect');
}

let Foo$1 = @fooDecorator$1
class Foo {};

function fooDecorator() {
	console.log('second effect');
}

@fooDecorator
class Foo {}

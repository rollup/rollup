function fooDecorator$1() {
	console.log('effect');
}

@fooDecorator$1
class Foo$1 {}

function fooDecorator() {
	console.log('effect');
}

@fooDecorator
class Foo {}

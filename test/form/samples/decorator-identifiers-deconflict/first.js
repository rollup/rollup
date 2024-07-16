function fooDecorator() {
	console.log('effect');
}

@fooDecorator
class Foo {}

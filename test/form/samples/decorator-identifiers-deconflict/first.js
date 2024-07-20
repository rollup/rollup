function fooDecorator() {
	console.log('first effect');
}

@fooDecorator
class Foo {}

function fooDecorator() {
	console.log('second effect');
}

@fooDecorator
class Foo {}

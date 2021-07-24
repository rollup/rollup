class Foo {
	static echo(message) {
		this.prototype.echo(message);
	}
	echo(message) {
		console.log(message);
	}
}

class Bar extends Foo {}

global.baz = 'PASS';
Bar.echo(baz);

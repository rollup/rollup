class Foo {
	constructor(x) {
		this.x = x;
	}
	output() {
		console.log(this.x);
	}
}

const foo = new Foo(123);
foo.output();
export { Foo as Bar };

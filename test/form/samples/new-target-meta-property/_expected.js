class Foo {
	constructor() {
		console.log(new.target.name);
	}
}

new Foo();

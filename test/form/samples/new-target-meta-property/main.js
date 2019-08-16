class Foo {
	constructor() {
		console.log(new.target.name);
		const unused = new.target.name;
	}
}

const x = new Foo();

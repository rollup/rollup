class Example {
	static #foo;
	static foo;

	static {
		this.#foo = 'static-initialization-block';
	}

	static {
		this.foo = 'another-static-initialization-block';
	}

	// We can not yet remove unused class body elements
	static {
	}

	static {}
}

class WithAssignment {
	static foo = 'bar';

	static someStatic() {
		return 'foo';
	}

	static {
		WithAssignment.foo = WithAssignment.someStatic();
	}
}

console.log(WithAssignment.foo);

class UnusedWithError {
	static {
		throw new Error('no code after this point');
	}
}

export { Example };

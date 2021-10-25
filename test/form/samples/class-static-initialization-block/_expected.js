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

class UnusedWithError {
	static {
		throw new Error('no code after this point');
	}
}

console.log(UsedAfterError);

throw new Error('No side-effects after this point');

class UsedAfterError {
	static {
	}
}

export { Example };

export class Example {
	static #foo;
	static foo;

	static {
		const foo = 'tree-shaken';
		this.#foo = 'static-initialization-block';
	}

	static {
		const foo = 'tree-shaken';
		this.foo = 'another-static-initialization-block';
	}

	// We can not yet remove unused class body elements
	static {
		const foo = 'tree-shaken';
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

class UnusedNoEffect {
	static {
		const foo = 'unused';
	}
}

class UnusedWithError {
	static {
		throw new Error('no code after this point');
		console.log('removed');
	}
}

console.log(UsedAfterError);

throw new Error('No side-effects after this point');

console.log('removed');

class UsedAfterError {
	static {
		console.log('removed');
	}
}

class Example {
	static #foo

	static foo

	static {
		const foo = 'tree-shaken';
		this.#foo = 'static-initialization-block'
	}

	static {
		const foo = 'tree-shaken';
		this.foo = 'another-static-initialization-block'
	}
}

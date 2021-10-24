class Example {
	static #foo

	static foo

	static {
		this.#foo = 'static-initialization-block'
	}

	static {
		this.foo = 'another-static-initialization-block'
	}
}

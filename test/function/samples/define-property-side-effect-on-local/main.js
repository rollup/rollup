class A {
	constructor() {
		const local = (this.b = {})
		Object.defineProperty(local, 'c', { value: 42 })
	}
}

assert.equal(new A().b.c, 42)


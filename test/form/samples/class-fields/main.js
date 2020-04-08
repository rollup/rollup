class Example {
	a = 1;
	b = this.a + 1;
	#p = () => {
		const x = 'tree-shaken';
	};

	constructor() {
		console.log(this.#p);
	}
}

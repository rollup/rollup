class Example {
	a = 1;
	b = this.a + 1;
	#p = () => {
	};

	constructor() {
		console.log(this.#p);
	}
}

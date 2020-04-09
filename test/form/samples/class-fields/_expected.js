class Example {
	firstPublicField = 1;
	secondPublicField = this.firstPublicField + 1;

	#privateField = () => {
	};

	#uninitializedPrivateField;

	// Those are apparently unsupported at the moment
	// get #getter() {
	// 	return this.#uninitializedPrivateField;
	// }

	// set #setter(value) {
	// 	this.#uninitializedPrivateField = value;
	// }

	// #privateMethod() {
	// 	const foo = 'tree-shaken';
	// }

	static publicStaticField = () => {
	};

	static #privateStaticField = () => {
	};

	static #privateStaticMethod(){
	}
}

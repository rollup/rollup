class Example extends SomeClass {
	firstPublicField = 1;
	secondPublicField = this.firstPublicField + super.someField;

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

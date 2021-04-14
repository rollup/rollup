class Example extends SomeClass {
	firstPublicField = 1;
	secondPublicField = this.firstPublicField + super.someField;

	publicField = () => {
		const foo = 'tree-shaken';
	};

	#privateField = () => {};

	#uninitializedPrivateField;

	get #getter() {
		return this.#uninitializedPrivateField;
	}

	set #setter(value) {
		this.#uninitializedPrivateField = value;
	}

	#privateMethod() {
		const foo = 'tree-shaken';
	}

	static firstPublicStaticField = 2;
	static secondPublicStaticField = this.firstPublicStaticField + super.someStaticField;

	static publicStaticField = () => {
		const foo = 'tree-shaken';
	};

	static #privateStaticField = () => {};

	static #privateStaticMethod() {}
}

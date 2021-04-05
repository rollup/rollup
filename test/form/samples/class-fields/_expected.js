class Example extends SomeClass {
	firstPublicField = 1;
	secondPublicField = this.firstPublicField + super.someField;

	publicField = () => {
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
	}

	static firstPublicStaticField = 2;
	static secondPublicStaticField = this.firstPublicStaticField + super.someStaticField;

	static publicStaticField = () => {
	};

	static #privateStaticField = () => {};

	static #privateStaticMethod() {}
}

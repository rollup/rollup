class PublicField {
	value = console.log('public');
}
new PublicField();

class PrivateField {
	#value = console.log('private');
}
new PrivateField();

class Parent {
	value = console.log('inherited');
}
class Child extends Parent {}
new Child();

class WithConstructor {
	value = console.log('with constructor');
	constructor() {}
}
new WithConstructor();

class GetterRead {
	get value() {
		console.log('getter');
	}
	copy = this.value;
}
new GetterRead();

class Instantiating {
	child = new PublicField();
}
new Instantiating();

const unusedInstance = new (class {
	value = console.log('class expression');
})();

class Recursive {
	child = new Recursive();
}
new Recursive();

class Static {
	static value = console.log('static');
}

class NoEffects {
	number = 1;
	list = [];
	object = { key: 'value' };
	callback = () => console.log('removed');
	#private = 2;
	sum = this.number + this.#private;
	uninitialized;
}
new NoEffects();

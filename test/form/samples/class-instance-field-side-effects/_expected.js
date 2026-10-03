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

new (class {
	value = console.log('class expression');
})();

class Static {
	static value = console.log('static');
}

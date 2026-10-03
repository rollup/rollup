class PublicField {
	value = log('public');
}
new PublicField();

class PrivateField {
	#value = log('private');
}
new PrivateField();

class Parent {
	value = log('inherited');
}
class Child extends Parent {}
new Child();

class GetterRead {
	get value() {
		log('getter');
	}
	copy = this.value;
}
new GetterRead();

class NoEffects {
	number = 1;
	sum = this.number + 1;
}
new NoEffects();

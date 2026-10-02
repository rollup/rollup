let effect1 = false;
let effect2 = false;

class Foo {}
function Bar() {}

function checkInstanceFoo(instance) {
	if (instance instanceof Foo) {
		effect1 = true;
	}
}

function checkInstanceBar(instance) {
	if (instance instanceof Bar) {
		effect2 = true;
	}
}

checkInstanceFoo(new Foo());
checkInstanceBar(new Bar());
assert.ok(effect1);
assert.ok(effect2);

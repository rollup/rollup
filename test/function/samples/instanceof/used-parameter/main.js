let effect = false;

class Foo {}

function checkInstance(instance) {
	if (instance instanceof Foo) {
		effect = true;
	}
}

checkInstance(new Foo());
assert.ok(effect);

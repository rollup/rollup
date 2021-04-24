const obj = {};
addGetter(obj);

let mutated = false;
obj.prop;
assert.ok(mutated);

function addGetter(o) {
	Object.defineProperty(o, 'prop', {
		get() {
			mutated = true;
		}
	});
}

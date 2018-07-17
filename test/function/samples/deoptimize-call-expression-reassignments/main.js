let foo = false;
const obj = {};

reassignFoo();

(foo
	? function() {
			return obj;
	  }
	: function() {
			return {};
	  })().x = true;

(foo
	? () => obj
	: () => ({}))().y = true;

if (!obj.x) {
	throw new Error('function reassignment was not tracked');
}

if (!obj.y) {
	throw new Error('arrow function reassignment was not tracked');
}

function reassignFoo() {
	foo = true;
}

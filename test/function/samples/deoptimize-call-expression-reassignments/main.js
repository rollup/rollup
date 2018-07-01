let foo = false;
const obj = {x: false};

reassignFoo();

(foo ? () => obj : () => ({}))().x = true;

if (!obj.x) {
	throw new Error('Reassignment was not tracked');
}

function reassignFoo() {
	foo = true;
}

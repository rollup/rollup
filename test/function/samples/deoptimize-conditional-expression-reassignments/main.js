let obj1 = { x: false },
	obj2 = { x: false };

let foo = false;

reassignFoo();

(foo ? obj1 : obj2).x = true;

if (!obj1.x || obj2.x) {
	throw new Error('Reassignment was not tracked');
}

function reassignFoo() {
	foo = true;
}

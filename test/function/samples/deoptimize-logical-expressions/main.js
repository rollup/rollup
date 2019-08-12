let foo = false;

reassignFoo();

if (!(foo && true)) {
	throw new Error('Literal reassignment was not tracked');
}

if (!(foo || (() => false))()) {
	throw new Error('Return value reassignment was not tracked');
}

function reassignFoo() {
	foo = () => true;
}

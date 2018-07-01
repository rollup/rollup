let foo = false;

reassignFoo();

if (!(foo ? true : false)) {
	throw new Error('Literal reassignment was not tracked');
}

if (!(foo ? () => true : () => false)()) {
	throw new Error('Return expression reassignment was not tracked');
}

function reassignFoo() {
	foo = true;
}

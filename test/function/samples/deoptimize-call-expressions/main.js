let foo = false;

reassignFoo();

if ((foo ? () => false : () => true)()) {
	throw new Error('Literal reassignment was not tracked');
}

if ((foo ? () => () => false : () => () => true)()()) {
	throw new Error('Return expression reassignment was not tracked');
}

function reassignFoo() {
	foo = true;
}

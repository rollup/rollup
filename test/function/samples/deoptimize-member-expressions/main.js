let foo = 'foo',
	bar = 'bar';

const obj = {
	foo: true,
	bar: () => false,
	baz: () => true
};

reassign();

if (obj[foo]) {
	throw new Error('Literal reassignment was not tracked');
}

if (!obj[bar]()) {
	throw new Error('Return expression reassignment was not tracked');
}

function reassign() {
	foo = 'reassigned';
	bar = 'baz';
}

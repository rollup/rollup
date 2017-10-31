const foo = { mightBeExported: {} };
const exported = {};

function assignExported ( obj ) {
	obj.mightBeExported = exported;
}

// Maybe we can keep the second line if instead of crippling
// assignments, we properly associate assignments
// because foo included => assignment is kept
// maybe it is also enough to keep calls to included vars if
// assignment works
assignExported( foo );
foo.mightBeExported.bar = 'present';

export default exported;

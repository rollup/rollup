const foo = { mightBeExported: {} };
const exported = {};

function assignExported ( obj ) {
	obj.mightBeExported = exported;
}

assignExported( foo );
foo.mightBeExported.bar = 'present';

export default exported;

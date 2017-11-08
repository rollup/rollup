const foo = { mightBeExported: {} };
const exported = {};

class AssignExported {
	constructor ( obj ) {
		obj.mightBeExported = exported;
	}
}

const bar = new AssignExported( foo );
foo.mightBeExported.bar = 'present';

export default exported;

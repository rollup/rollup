const foo = { mightBeExported: {} };
const exported = {};

function AssignExported ( obj ) {
	obj.mightBeExported = exported;
}

const bar = new AssignExported( foo );
foo.mightBeExported.bar = 'present';

export default exported;

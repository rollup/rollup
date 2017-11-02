const foo = { mightBeExported: {} };
const exported = {};

function getAssignExported () {
	return function assignExported ( obj ) {
		obj.mightBeExported = exported;
	};
}

getAssignExported()( foo );
foo.mightBeExported.bar = 'present';

export default exported;

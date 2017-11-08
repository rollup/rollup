const foo = { mightBeExported: {} };
const exported = {};
const assigner = {
	assignExported ( obj ) {
		obj.mightBeExported = exported;
	}
};

assigner.assignExported( foo );
foo.mightBeExported.bar = 'present';

export default exported;

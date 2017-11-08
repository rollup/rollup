const foo = { mightBeExported: {} };
const exported = {};
const fooContainer = {
	set addMightBeExported ( obj ) {
		obj.mightBeExported = exported;
	}
};

fooContainer.addMightBeExported = foo;
foo.mightBeExported.bar = 'present';

export default exported;

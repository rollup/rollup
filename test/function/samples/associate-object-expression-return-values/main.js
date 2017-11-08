const foo = { mightBeExported: {} };
const exported = {};
const assigner = {
	getFoo () {
		return foo;
	}
};

assigner.getFoo().mightBeExported = exported;
foo.mightBeExported.bar = 'present';

export default exported;

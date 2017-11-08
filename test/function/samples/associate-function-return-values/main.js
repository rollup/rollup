const foo = { mightBeExported: {} };
const exported = {};

function getFoo () {
	return foo;
}

getFoo().mightBeExported = exported;
foo.mightBeExported.bar = 'present';

export default exported;

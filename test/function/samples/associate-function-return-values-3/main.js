const foo = { mightBeExported: {} };
const exported = {};

function getGetFoo () {
	return () => foo;
}

getGetFoo()().mightBeExported = exported;
foo.mightBeExported.bar = 'present';

export default exported;

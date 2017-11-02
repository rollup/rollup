const foo = { mightBeExported: {} };
const exported = {};

function getFoo () {
	return foo;
}

(Math.random() < 0.5 ? true && getFoo : false || getFoo)().mightBeExported = exported;
foo.mightBeExported.bar = 'present';

export default exported;

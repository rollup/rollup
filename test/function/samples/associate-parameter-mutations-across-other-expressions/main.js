const foo = { mightBeExported: {} };
const exported = {};

function assignExported ( obj ) {
	obj.mightBeExported = exported;
}

(Math.random() < 0.5 ? true && assignExported : false || assignExported)( foo );
foo.mightBeExported.bar = 'present';

export default exported;

const foo = { mightBeExported: {} };
const exported = {};

function Bar () {}

Bar.prototype.assignExported = function ( obj ) {
	obj.mightBeExported = exported;
};

const bar = new Bar();
bar.assignExported( foo );
foo.mightBeExported.bar = 'present';

export default exported;

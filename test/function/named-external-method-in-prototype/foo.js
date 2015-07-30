import { bar } from 'bar';

export default function Foo() {
	// XXX: one does not even have to call the method, simply having it defined
	// on the prototype triggers the failure
	//return this.bar();
	return bar.foobar();
}

// XXX: this prototype definition throws it of, comment it out and it at least
// fails at runtime because it generates wrong code
Foo.prototype.bar = function () {
	// XXX: it also has to be a nested function, simply calling `bar()` here
	// works, or at least it fails ar runtime like the case above
	return bar.foobar();
};

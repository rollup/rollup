import { bar } from './bar';

var Foo = function () {
	this.id = incr();
};

bar.apply( Foo.prototype );

var count = 0;
function incr () { return count++; };

export { Foo };

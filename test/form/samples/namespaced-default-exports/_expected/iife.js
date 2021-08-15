this.foo = this.foo || {};
this.foo.bar = this.foo.bar || {};
this.foo.bar.baz = (function () {
	'use strict';

	var main = 42;

	return main;

})();

System.register('computedProperties', [], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			var foo = 'foo';
			var bar = 'bar';
			var baz = 'baz';
			var bam = 'bam';

			var x = exports("x", { [foo]: 'bar' });

			class X {
				[bar] () {}
				get [baz] () {}
				set [bam] ( value ) {}
			} exports("X", X);

		})
	};
}));

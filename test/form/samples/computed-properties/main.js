var foo = 'foo';
var bar = 'bar';
var baz = 'baz';
var bam = 'bam';

export var x = { [foo]: 'bar' };

export class X {
	[bar] () {}
	get [baz] () {}
	set [bam] ( value ) {}
}

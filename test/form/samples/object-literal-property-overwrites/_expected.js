const retained1 = {
	foo: () => {},
	foo: function () {this.x = 1;}
};
retained1.foo();

const retained2 = {
	foo: () => {},
	['f' + 'oo']: function () {this.x = 1;},
	['b' + 'ar']: () => {}
};
retained2.foo();

const retained3 = {
	['fo' + 'o']: () => {},
	['f' + 'oo']: () => {}
};
retained3.bar();

const retained4 = {
	foo: globalThis.unknown
};
retained4.foo.bar = 1;

const retained5 = {
	['f' + 'oo']: globalThis.unknown};
retained5.foo.bar = 1;

const retained6 = {
	};
retained6.bar.baz = 1;

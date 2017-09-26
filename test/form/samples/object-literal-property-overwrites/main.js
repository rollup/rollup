const removed1 = {
	foo: () => {},
	foo: () => {},
	['f' + 'oo']: () => {}
};
removed1.foo();

const removed2 = {
	foo: () => console.log( 'effect' ),
	foo: () => {}
};
removed2.foo();

const removed3 = {
	['fo' + 'o']: function () {this.x = 1;},
	['f' + 'oo']: () => console.log( 'effect' ),
	foo: () => {}
};
removed3.foo();

const removed4 = {
	foo: () => {},
	foo: () => {},
	['f' + 'oo']: () => {}
};
removed4.foo.bar = 1;

const removed5 = {
	foo: globalVar,
	foo: () => {}
};
removed5.foo.bar = 1;

const removed6 = {
	['f' + 'oo']: globalVar,
	['fo' + 'o']: globalVar,
	foo: () => {}
};
removed6.foo.bar = 1;

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
	foo: {},
	foo: globalVar
};
retained4.foo.bar = 1;

const retained5 = {
	foo: {},
	['f' + 'oo']: globalVar,
	['b' + 'ar']: {},
};
retained5.foo.bar = 1;

const retained6 = {
	['fo' + 'o']: {},
	['f' + 'oo']: {}
};
retained6.bar.baz = 1;

define(function () { 'use strict';

	const retained1 = {};
	const retainedResult1 = retained1.foo.bar;

	const retained2 = new function () {}();
	const retainedResult2 = retained2.foo.bar;

	const retained3 = void {};
	const retainedResult3 = retained3.foo;

	let retained4a;
	const retained4b = retained4a = undefined;
	const retainedResult4 = retained4b.foo;

	const retained5 = 1 + 2;
	const retainedResult5 = retained5.foo.bar;

	const retained6 = class {};
	const retainedResult6 = retained6.foo.bar;

	let retained7 = 3;
	const retainedResult7 = (retained7++).foo.bar;

	const retained8 = globalVar.x;

});

import * as bar from './bar';

export default function foo () {}

foo.x = function () {
	doSomethingWith( bar );
};

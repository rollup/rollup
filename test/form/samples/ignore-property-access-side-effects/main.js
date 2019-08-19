const getter = {
	get foo () {
		console.log( 'effect' );
	}
};
const foo1 = getter.foo;

const empty = {};
const foo2 = empty.foo.tooDeep;

function accessArg(arg) {
	const foo3 = arg.tooDeep;
}
accessArg(null);

const foo4 = globalThis.globalThis.unknown.unknownProperty;

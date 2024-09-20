// NAMED EXPORTS
// There are many ways to export bindings
// from an ES2015 module
export var foo = 1;

export function bar() {
	// try changing this to `foo++`
	// when generating CommonJS
	return foo;
}

function baz() {
	return bar();
}

export * from './qux';
export { baz };

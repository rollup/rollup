var foo;

bar();

function bar() {
	globalSideEffect = true;
}

export { foo };

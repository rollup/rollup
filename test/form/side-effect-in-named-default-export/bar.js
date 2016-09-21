export var foo;

bar();

export default function bar() {
	globalSideEffect = true;
}

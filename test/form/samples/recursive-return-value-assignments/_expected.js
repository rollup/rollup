function foo() {
	return foo()();
}

foo().x = 1;

function foo() {
	loop: while (unknown) {
		if (unknown) {
			break loop;
		}
		bar();
	}
}

function bar() {
	loop: while (unknown) {
		if (unknown) {
			break loop;
		}
		foo();
	}
}

unused: {
}

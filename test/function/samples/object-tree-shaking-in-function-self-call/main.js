function foo(v) {
	if (v.a) {
		foo(v.b);
		foo(v.c);
	}
}
foo({ b: 1 });

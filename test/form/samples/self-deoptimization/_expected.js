function foo(a) {
	var b = bar({}, a);
	b && b.delete();
}

function bar(a, b) {
	return (b = 1) ? a.a[b] || null : null;
}

foo({});

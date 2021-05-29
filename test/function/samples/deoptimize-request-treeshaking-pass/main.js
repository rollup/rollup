function heisenbug() {
	var a = false;
	function f(b) {
		if (a) a === b.c ? result.value++ : result.value--;
		a = b.c;
	}
	function g() {}
	function h() {
		f({
			c: g
		});
	}
	h();
	h();
}
heisenbug();
heisenbug();

function fun1(enable) {
	if (enable) {
		return 'fun1';
	}
}

function fun2(enable) {
	if (enable) {
		return fun1(enable);
	}
}

console.log(fun2(true));
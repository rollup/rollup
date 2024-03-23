function fun1(options) {
	if (options.enable) {
		return 'fun1';
	} else {
		console.log(222);
	}
}

function fun2(options) {
	if (options.enable) {
		return fun1(options);
	} else {
		console.log(111);
	}
}

console.log(
	fun2({
		enable: true
	})
);

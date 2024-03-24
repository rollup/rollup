function fun1(options) {
	if (options.enable) {
		return 'fun1';
	}
}

function fun2(options) {
	if (options.enable) {
		return fun1(options);
	}
}

function fun4(options) {
	if (options.enable) ; else {
		console.log('func4');
	}
}

console.log(
	fun2({
		enable: true
	}),
	fun4({
		enable: false
	})
);

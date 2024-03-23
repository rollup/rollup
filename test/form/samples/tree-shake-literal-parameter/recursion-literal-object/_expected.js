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

console.log(
	fun2({
		enable: true
	})
);

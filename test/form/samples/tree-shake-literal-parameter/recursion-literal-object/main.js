function fun1(options) {
	if (options.enable) {
		return 'fun1';
	} else {
		console.log('func1');
	}
}

function fun2(options) {
	if (options.enable) {
		return fun1(options);
	} else {
		console.log('func2');
	}
}

function fun3(options) {
	if (options.enable) {
		return 'fun3';
	} else {
		console.log('func3');
	}
}

function fun4(options) {
	if (options.enable) {
		return fun3(options);
	} else {
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

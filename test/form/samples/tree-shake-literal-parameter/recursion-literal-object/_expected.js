function fun1(options) {
	{
		return 'fun1';
	}
}

function fun2(options) {
	{
		return fun1();
	}
}

function fun4(options) {
	{
		console.log('func4');
	}
}

console.log(
	fun2(),
	fun4()
);

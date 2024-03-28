function fun1(enable) {
	{
		return 'fun1';
	}
}

function fun2(enable) {
	{
		return fun1();
	}
}

console.log(fun2());
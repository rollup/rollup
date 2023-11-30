export function f(val) {
	{
		var val = 1;
		var val = 2;
	}
	assert.equal(val, 2);
}
f(0);

export function g(val) {
	{
		{
			var val = 1;
		}
		{
			var val = 2;
		}
	}
	assert.equal(val, 2);
}
g(0);

const result1 = ((enable) => {
	{
		return 'enabled';
	}
})();

const result2 = (function (enable) {
	{
		return 'enabled';
	}
})();

console.log(result1);
console.log(result2);

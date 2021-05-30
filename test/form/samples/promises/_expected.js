Promise.resolve({
	then() {
		console.log(1);
	}
});

Promise.resolve({
	get then() {
		return () => console.log(2);
	}
});

Promise.reject('should be kept for uncaught rejections');

Promise.all([
	{
		then() {
			console.log(3);
		}
	},
	null
]);

Promise.all([
	null,
	{
		get then() {
			return () => console.log(4);
		}
	}
]);

Promise.race([
	{
		then() {
			console.log(5);
		}
	},
	null
]);

Promise.race([
	null,
	{
		get then() {
			return () => console.log(6);
		}
	}
]);

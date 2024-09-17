export const foo = (() => {
	let foo = false;
	{
		foo = true;
	}
	return foo;
})();

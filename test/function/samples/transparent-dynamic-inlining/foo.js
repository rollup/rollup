export var x = 42;
import('./main').then(x => {
	const expected = { y: 42 };
	Object.setPrototypeOf(expected, null);

	assert.deepStrictEqual(x, expected);
});

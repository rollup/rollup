export var x = 42;
import('./main').then(x => {
	assert.deepStrictEqual(x, { y: 42 });
});

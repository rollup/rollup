import resolutions from 'resolutions';

assert.deepStrictEqual(resolutions, [
	{
		id: 'bar-resolution',
		text: 'bar'
	},
	{
		id: 'foo-resolution',
		text: 'foo'
	},
	{
		id: 'own-resolution',
		text: 'unskipped'
	},
	{
		id: 'other-resolution',
		text: 'skipped'
	}
]);

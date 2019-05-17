import resolutions from 'resolutions';

assert.deepStrictEqual(resolutions, [
	{
		id: 'own-resolution',
		text: 'all'
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

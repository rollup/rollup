import resolutions from 'resolutions';

assert.deepStrictEqual(resolutions, [
	{
		id: 'other-resolution',
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

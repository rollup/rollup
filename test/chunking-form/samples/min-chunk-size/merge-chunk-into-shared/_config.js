module.exports = defineTest({
	description:
		'merges small chunks into shared chunks that are loaded by a super-set of entry points',
	options: {
		input: ['main1.js', 'main2.js', 'main3.js'],
		output: {
			experimentalMinChunkSize: 100
		}
	},
	logs: [
		{
			level: 'info',
			code: 'OPTIMIZE_CHUNK_STATUS',
			message: 'After merging chunks, there are\n4 chunks, of which\n3 are below minChunkSize.'
		},
		{
			level: 'info',
			code: 'OPTIMIZE_CHUNK_STATUS',
			message: 'After merging chunks, there are\n4 chunks, of which\n3 are below minChunkSize.'
		},
		{
			level: 'info',
			code: 'OPTIMIZE_CHUNK_STATUS',
			message: 'After merging chunks, there are\n4 chunks, of which\n3 are below minChunkSize.'
		},
		{
			level: 'info',
			code: 'OPTIMIZE_CHUNK_STATUS',
			message: 'After merging chunks, there are\n4 chunks, of which\n3 are below minChunkSize.'
		},
		{
			level: 'info',
			code: 'OPTIMIZE_CHUNK_STATUS',
			message: 'Initially, there are\n5 chunks, of which\n4 are below minChunkSize.'
		},
		{
			level: 'info',
			code: 'OPTIMIZE_CHUNK_STATUS',
			message: 'Initially, there are\n5 chunks, of which\n4 are below minChunkSize.'
		},
		{
			level: 'info',
			code: 'OPTIMIZE_CHUNK_STATUS',
			message: 'Initially, there are\n5 chunks, of which\n4 are below minChunkSize.'
		},
		{
			level: 'info',
			code: 'OPTIMIZE_CHUNK_STATUS',
			message: 'Initially, there are\n5 chunks, of which\n4 are below minChunkSize.'
		}
	]
});

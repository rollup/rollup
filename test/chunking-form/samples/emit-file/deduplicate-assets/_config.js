module.exports = {
	description: 'deduplicates asset that have the same source',
	options: {
		input: ['main.js'],
		plugins: {
			buildStart() {
				this.emitFile({ type: 'asset', name: 'string.txt', source: 'hello world' });
				this.emitFile({ type: 'asset', name: 'otherString.txt', source: 'hello world' });
				this.emitFile({
					type: 'asset',
					name: 'buffer.txt',
					source: Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72])
				});
				this.emitFile({
					type: 'asset',
					name: 'otherBuffer.txt',
					source: Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72])
				});

				// specific file names will not be deduplicated
				this.emitFile({ type: 'asset', fileName: 'named/string.txt', source: 'hello world' });
				this.emitFile({
					type: 'asset',
					fileName: 'named/buffer.txt',
					source: Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72])
				});
				return null;
			}
		}
	}
};

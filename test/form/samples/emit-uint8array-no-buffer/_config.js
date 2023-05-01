const Buffer = global.Buffer;

module.exports = defineTest({
	description: 'supports emitting assets as Uint8Arrays when Buffer is not available',
	before() {
		delete global.Buffer;
	},
	after() {
		global.Buffer = Buffer;
	},
	options: {
		plugins: {
			name: 'test',
			resolveId(id) {
				if (id.startsWith('asset')) {
					return id;
				}
			},
			load(id) {
				if (id.startsWith('asset')) {
					return `export default import.meta.ROLLUP_FILE_URL_${this.emitFile({
						type: 'asset',
						source: Uint8Array.from([...id].map(char => char.charCodeAt(0)))
					})};`;
				}
			}
		}
	}
});

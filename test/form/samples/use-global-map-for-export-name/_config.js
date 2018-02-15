module.exports = {
	description: 'applies globals to output name',
	options: {
		output: {
			name: 'leaflet.terminator',
			globals: { 'leaflet': 'L' }
		},
		external: [ 'leaflet' ],
	}
};

module.exports = {
	description: 'applies globals to output name',
	options: {
		name: 'leaflet.terminator',
		external: [ 'leaflet' ],
		globals: {
			'leaflet': 'L'
		}
	}
};

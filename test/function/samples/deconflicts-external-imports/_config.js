module.exports = {
	description: 'deconflicts external imports',
	context: {
		require: function ( id ) {
			return function () {
				return id;
			};
		}
	},
	options: {
		external: [ 'foo', 'bar' ]
	}
};

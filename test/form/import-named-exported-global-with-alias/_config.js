module.exports = {
	description: 'allow globals to be exported and imported',
	options: {
		moduleName: 'doc',
		onwarn: warning => {
			if ( warning.code !== 'EMPTY_BUNDLE' ) throw new Error( 'unexpected warning' );
		}
	}
};

export default function getExportBlock ( bundle, exportMode, mechanism = 'return' ) {
	if ( exportMode === 'default' ) {
		const defaultExportName = bundle.exports.lookup( 'default' ).name;

		return `${mechanism} ${defaultExportName};`;
	}

	return bundle.toExport
		.map( name => {
			const prop = name === 'default' ? `['default']` : `.${name}`;
			const id = bundle.exports.lookup( name );
			return `exports${prop} = ${id.name};`;
		})
		.join( '\n' );
}

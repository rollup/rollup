function propertyAccess ( name ) {
	return name === 'default' ? `['default']` : `.${name}`;
}

export default function getExportBlock ( bundle, exportMode, mechanism = 'return' ) {
	if ( exportMode === 'default' ) {
		const defaultExportName = bundle.exports.lookup( 'default' ).name;

		return `${mechanism} ${defaultExportName};`;
	}

	return bundle.toExport
		.map( name => {
			const id = bundle.exports.lookup( name );

			const reference = ( id.originalName !== 'default' && id.module && id.module.isExternal ) ?
				id.module.name + propertyAccess( id.name ) : id.name;

			return `exports${propertyAccess( name )} = ${reference};`;
		})
		.join( '\n' );
}

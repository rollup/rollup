function wrapAccess ( id ) {
	return ( id.originalName !== 'default' && id.module && id.module.isExternal ) ?
		id.module.name + propertyAccess( id.originalName ) : id.name;
}

function propertyAccess ( name ) {
	return name === 'default' ? `['default']` : `.${name}`;
}

export default function getExportBlock ( bundle, exportMode, mechanism = 'return' ) {
	if ( exportMode === 'default' ) {
		const id = bundle.exports.lookup( 'default' );

		return `${mechanism} ${wrapAccess( id )};`;
	}

	return bundle.toExport
		.map( name => {
			const id = bundle.exports.lookup( name );

			return `exports${propertyAccess( name )} = ${wrapAccess( id )};`;
		})
		.join( '\n' );
}

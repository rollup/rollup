export default function getExportBlock ( bundle, exportMode, mechanism = 'return' ) {
	if ( exportMode === 'default' ) {
		return `${mechanism} ${bundle.entryModule.declarations.default.render( false )};`;
	}

	return bundle.toExport
		.map( name => {
			const prop = name === 'default' ? `['default']` : `.${name}`;
			const declaration = bundle.entryModule.traceExport( name );

			if ( declaration.isReassigned ) return null;
			return `exports${prop} = ${declaration.render( false )};`;
		})
		.filter( Boolean )
		.join( '\n' );
}

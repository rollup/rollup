export default function getExportBlock ( bundle, exportMode, mechanism = 'return' ) {
	if ( exportMode === 'default' ) {
		return `${mechanism} ${bundle.entryModule.declarations.default.render( false )};`;
	}

	return bundle.toExport
		.map( name => {
			const prop = name === 'default' ? `['default']` : `.${name}`;
			const declaration = bundle.entryModule.traceExport( name );

			const lhs = `exports${prop}`;
			const rhs = declaration.render( false );

			// prevent `exports.count = exports.count`
			if ( lhs === rhs ) return null;

			return `${lhs} = ${rhs};`;
		})
		.filter( Boolean )
		.join( '\n' );
}

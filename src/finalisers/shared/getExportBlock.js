export default function getExportBlock ( entryModule, exportMode, mechanism = 'return' ) {
	if ( exportMode === 'default' ) {
		return `${mechanism} ${entryModule.traceExport( 'default' ).getName( false )};`;
	}

	return entryModule.getExports()
		.map( name => {
			const prop = name === 'default' ? `['default']` : `.${name}`;
			const declaration = entryModule.traceExport( name );

			const lhs = `exports${prop}`;
			const rhs = declaration ?
				declaration.getName( false ) :
				name; // exporting a global

			// prevent `exports.count = exports.count`
			if ( lhs === rhs ) return null;

			return `${lhs} = ${rhs};`;
		})
		.filter( Boolean )
		.join( '\n' );
}

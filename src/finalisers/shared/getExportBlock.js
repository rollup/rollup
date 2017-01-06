export default function getExportBlock ( bundle, exportMode, mechanism = 'return' ) {
	const entryModule = bundle.entryModule;

	if ( exportMode === 'default' ) {
		return `${mechanism} ${entryModule.traceExport( 'default' ).getName( false )};`;
	}

	return entryModule.getExports()
		.map( name => {
			if ( name[0] === '*' ) {
				// export all from external
				const id = name.slice( 1 );
				const module = bundle.moduleById.get( id );

				return `Object.keys(${module.name}).forEach(function (key) { exports[key] = ${module.name}[key]; });`;
			}

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

export default function getExportBlock ( bundle, exportMode, mechanism = 'return' ) {
	if ( exportMode === 'default' ) {
		return `${mechanism} ${bundle.entryModule.defaultName()};`;
	}

	return bundle.toExport
		.map( name => {
			const prop = name === 'default' ? `['default']` : `.${name}`;
			const declaration = bundle.entryModule.traceExport( name );
			return `exports${prop} = ${declaration.name};`;
		})
		.join( '\n' );
}

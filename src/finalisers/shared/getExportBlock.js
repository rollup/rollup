export default function getExportBlock ( bundle, exportMode, mechanism = 'return' ) {
	if ( exportMode === 'default' ) {
		return `${mechanism} ${bundle.entryModule.getCanonicalName('default', false)};`;
	}

	return bundle.toExport
		.map( name => {
			const prop = name === 'default' ? `['default']` : `.${name}`;
			return `exports${prop} = ${bundle.entryModule.scope.getExportName(name, false)};`;
		})
		.join( '\n' );
}

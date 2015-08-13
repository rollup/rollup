export default function getExportBlock ( bundle, exportMode, mechanism = 'return' ) {
	if ( exportMode === 'default' ) {
		return `${mechanism} ${bundle.entryModule.getCanonicalName('default')};`;
	}

	return bundle.toExport
		.map( name => {
			const prop = name === 'default' ? `['default']` : `.${name}`;
			return `exports${prop} = ${bundle.entryModule.getCanonicalName(name)};`;
		})
		.join( '\n' );
}

export default function getExportBlock ( bundle, exportMode, mechanism = 'return' ) {
	if ( exportMode === 'default' ) {
		return `${mechanism} ${bundle.entryModule.replacements.default};`;
	}

	return bundle.toExport
		.map( name => {
			const prop = name === 'default' ? `['default']` : `.${name}`;
			name = bundle.entryModule.replacements[ name ] || name;
			return `exports${prop} = ${name};`;
		})
		.join( '\n' );
}

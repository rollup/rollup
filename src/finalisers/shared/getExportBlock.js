export default function getExportBlock ( bundle, exportMode, mechanism = 'return' ) {
	if ( exportMode === 'default' ) {
		const defaultExport = bundle.entryModule.exports.default;
		let defaultExportName = bundle.entryModule.replacements.default || defaultExport.statement.node.declaration.name;

		return `${mechanism} ${defaultExportName};`;
	}

	return bundle.toExport
		.map( name => {
			const prop = name === 'default' ? `['default']` : `.${name}`;
			name = bundle.entryModule.replacements[ name ] || name;
			return `exports${prop} = ${name};`;
		})
		.join( '\n' );
}

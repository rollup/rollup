export default function getExportBlock ( bundle, exportMode, mechanism = 'return' ) {
	if ( exportMode === 'default' ) {
		const defaultExport = bundle.entryModule.exports.default;

		const defaultExportName = bundle.entryModule.replacements.default ||
			defaultExport.declaredName || // TODO can these be unified?
			defaultExport.statement.node.declaration.name;

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

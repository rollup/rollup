export default function getExportBlock ( bundle, exportMode, mechanism = 'return' ) {
	if ( exportMode === 'default' ) {
		const defaultExport = bundle.entryModule.exports.default;

		const defaultExportName = bundle.entryModule.replacements.default ||
			defaultExport.identifier;

		return `${mechanism} ${defaultExportName};`;
	}

	return bundle.toExport
		.map( name => {
			const prop = name === 'default' ? `['default']` : `.${name}`;
			const id = bundle.exports.lookup( name );
			return `exports${prop} = ${id.name};`;
		})
		.join( '\n' );
}

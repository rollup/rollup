import { keys } from '../utils/object';

export default function es6 ( bundle, magicString ) {
	const importBlock = bundle.externalModules
		.map( module => {
			const specifiers = [];

			if ( module.needsDefault ) {
				specifiers.push( module.importedByBundle.filter( declaration =>
					declaration.name === 'default' )[0].localName );
			}

			if ( module.needsAll ) {
				specifiers.push( '* as ' + module.importedByBundle.filter( declaration =>
					declaration.name === '*' )[0].localName );
			}

			if ( module.needsNamed ) {
				specifiers.push( '{ ' + module.importedByBundle
					.filter( declaration => !/^(default|\*)$/.test( declaration.name ) )
					.map( ({ name, localName }) =>
						name === localName ? name : `${name} as ${localName}` )
					.join( ', ' ) + ' }' );
			}

			return specifiers.length ?
				`import ${specifiers.join( ', ' )} from '${module.id}';` :
				`import '${module.id}';`;
		})
		.join( '\n' );

	if ( importBlock ) {
		magicString.prepend( importBlock + '\n\n' );
	}

	const exports = bundle.entryModule.exports;
	const exportBlock = keys( exports ).map( exportedName => {
		const specifier = exports[ exportedName ];

		const canonicalName = bundle.entryModule.replacements[ specifier.localName ] || specifier.localName;

		if ( exportedName === 'default' ) {
			return `export default ${canonicalName};`;
		}

		return exportedName === canonicalName ?
			`export { ${exportedName} };` :
			`export { ${canonicalName} as ${exportedName} };`;
	}).join( '\n' );

	if ( exportBlock ) {
		magicString.append( '\n\n' + exportBlock );
	}

	return magicString.trim();
}

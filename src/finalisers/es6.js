import { keys } from '../utils/object';

export default function es6 ( bundle, magicString, { exportMode }, options ) {
	const importBlock = bundle.externalModules
		.map( module => {
			let defaultSpecifier = null;
			let namedSpecifiers = null;

			if ( module.needsDefault ) {
				const defaultImportDeclaration = module.importedByBundle.filter( declaration => declaration.name === 'default' )[0];
				defaultSpecifier = defaultImportDeclaration.localName;
			}

			if ( module.needsNamed ) {
				namedSpecifiers = '{ ' + module.importedByBundle
					.filter( declaration => declaration.name !== 'default' )
					.map( declaration => {
						const { name, localName } = declaration;

						return name === localName ?
							name :
							`${name} as ${localName}`;
					})
					.join( ', ' ) + ' }';
			}

			const specifiers = module.needsDefault && module.needsNamed ?
				`${defaultSpecifier}, ${namedSpecifiers}` :
				( defaultSpecifier || namedSpecifiers );

			return specifiers ?
				`import ${specifiers} from '${module.id}';` :
				`import '${module.id}';`;
		})
		.join( '\n' );

	if ( importBlock ) {
		magicString.prepend( importBlock + '\n\n' );
	}

	const exports = bundle.entryModule.exports;
	const exportBlock = keys( exports ).map( exportedName => {
		const specifier = exports[ exportedName ];

		const canonicalName = bundle.entryModule.getCanonicalName( specifier.localName );

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

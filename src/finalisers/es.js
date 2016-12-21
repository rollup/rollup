import { keys } from '../utils/object.js';

function notDefault ( name ) {
	return name !== 'default';
}

export default function es ( bundle, magicString, { intro, outro } ) {
	const importBlock = bundle.externalModules
		.map( module => {
			const specifiers = [];
			const specifiersList = [specifiers];
			const importedNames = keys( module.declarations )
				.filter( name => name !== '*' && name !== 'default' )
				.map( name => {
					const declaration = module.declarations[ name ];

					if ( declaration.name === declaration.safeName ) return declaration.name;
					return `${declaration.name} as ${declaration.safeName}`;
				});

			if ( module.declarations.default ) {
				if ( module.exportsNamespace ) {
					specifiersList.push([ `${module.name}__default` ]);
				} else {
					specifiers.push( module.name );
				}
			}

			const namespaceSpecifier = module.declarations['*'] ? `* as ${module.name}` : null; // TODO prevent unnecessary namespace import, e.g form/external-imports
			const namedSpecifier = importedNames.length ? `{ ${importedNames.sort().join( ', ' )} }` : null;

			if ( namespaceSpecifier && namedSpecifier ) {
				// Namespace and named specifiers cannot be combined.
				specifiersList.push( [namespaceSpecifier] );
				specifiers.push( namedSpecifier );
			} else if ( namedSpecifier ) {
				specifiers.push( namedSpecifier );
			} else if ( namespaceSpecifier ) {
				specifiers.push( namespaceSpecifier );
			}

			return specifiersList
				.map( specifiers =>
					specifiers.length ?
						`import ${specifiers.join( ', ' )} from '${module.path}';` :
						`import '${module.path}';`
				)
				.join( '\n' );
		})
		.join( '\n' );

	if ( importBlock ) intro += importBlock + '\n\n';
	if ( intro ) magicString.prepend( intro );

	const module = bundle.entryModule;

	const specifiers = module.getExports().filter( notDefault ).map( name => {
		const declaration = module.traceExport( name );
		const rendered = declaration.getName( true );

		return rendered === name ?
			name :
			`${rendered} as ${name}`;
	});

	let exportBlock = specifiers.length ? `export { ${specifiers.join(', ')} };` : '';

	const defaultExport = module.exports.default || module.reexports.default;
	if ( defaultExport ) {
		exportBlock += `export default ${module.traceExport( 'default' ).getName( true )};`;
	}

	if ( exportBlock ) magicString.append( '\n\n' + exportBlock.trim() );
	if ( outro ) magicString.append( outro );

	return magicString.trim();
}

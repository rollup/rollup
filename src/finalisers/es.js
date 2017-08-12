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
				.filter( name => module.declarations[ name ].activated )
				.map( name => {
					if ( name[0] === '*' ) {
						return `* as ${module.name}`;
					}

					const declaration = module.declarations[ name ];

					if ( declaration.name === declaration.safeName ) return declaration.name;
					return `${declaration.name} as ${declaration.safeName}`;
				})
				.filter( Boolean );

			if ( module.declarations.default ) {
				if ( module.exportsNamespace ) {
					specifiersList.push([ `${module.name}__default` ]);
				} else {
					specifiers.push( module.name );
				}
			}

			const namespaceSpecifier = module.declarations['*'] && module.declarations['*'].activated ? `* as ${module.name}` : null; // TODO prevent unnecessary namespace import, e.g form/external-imports
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
				.map( specifiers => {
					if ( specifiers.length ) {
						return `import ${specifiers.join( ', ' )} from '${module.path}';`;
					}

					return module.reexported ?
						null :
						`import '${module.path}';`;
				})
				.filter( Boolean )
				.join( '\n' );
		})
		.join( '\n' );

	if ( importBlock ) intro += importBlock + '\n\n';
	if ( intro ) magicString.prepend( intro );

	const module = bundle.entryModule;

	const exportInternalSpecifiers = [];
	const exportExternalSpecifiers = new Map();
	const exportAllDeclarations = [];

	module.getExports()
		.filter( notDefault )
		.forEach( name => {
			const declaration = module.traceExport( name );
			const rendered = declaration.getName( true );
			exportInternalSpecifiers.push( rendered === name ? name : `${rendered} as ${name}` );
		});

	module.getReexports()
		.filter( notDefault )
		.forEach( name => {
			const declaration = module.traceExport( name );

			if ( declaration.isExternal ) {
				if ( name[0] === '*' ) {
					// export * from 'external'
					exportAllDeclarations.push( `export * from '${name.slice( 1 )}';` );
				} else {
					if ( !exportExternalSpecifiers.has( declaration.module.id ) ) exportExternalSpecifiers.set( declaration.module.id, [] );
					exportExternalSpecifiers.get( declaration.module.id ).push( name );
				}

				return;
			}

			const rendered = declaration.getName( true );
			exportInternalSpecifiers.push( rendered === name ? name : `${rendered} as ${name}` );
		});

	const exportBlock = [];
	if ( exportInternalSpecifiers.length ) exportBlock.push( `export { ${exportInternalSpecifiers.join(', ')} };` );
	if ( module.exports.default || module.reexports.default ) exportBlock.push( `export default ${module.traceExport( 'default' ).getName( true )};` );
	if ( exportAllDeclarations.length ) exportBlock.push( exportAllDeclarations.join( '\n' ) );
	if ( exportExternalSpecifiers.size ) {
		exportExternalSpecifiers.forEach( ( specifiers, id ) => {
			exportBlock.push( `export { ${specifiers.join( ', ' )} } from '${id}';` );
		});
	}

	if ( exportBlock.length ) magicString.append( '\n\n' + exportBlock.join( '\n' ).trim() );

	if ( outro ) magicString.append( outro );

	return magicString.trim();
}

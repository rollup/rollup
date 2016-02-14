import { keys } from '../utils/object.js';

function notDefault ( name ) {
	return name !== 'default';
}

export default function es6 ( bundle, magicString ) {
	const importBlock = bundle.externalModules
		.map( module => {
			const specifiers = [];
			const specifiersList = [specifiers];
			const importedNames = keys( module.declarations )
				.filter( name => name !== '*' && name !== 'default' );

			if ( module.declarations.default ) {
				specifiers.push( module.name );
			}

			const namespaceSpecifier = module.declarations['*'] ? `* as ${module.name}` : null;
			const namedSpecifier = importedNames.length ? `{ ${importedNames.join( ', ' )} }` : null;

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
						`import ${specifiers.join( ', ' )} from '${module.id}';` :
						`import '${module.id}';`
				)
				.join( '\n' );
		})
		.join( '\n' );

	if ( importBlock ) {
		magicString.prepend( importBlock + '\n\n' );
	}

	const module = bundle.entryModule;

	const specifiers = module.getExports().filter( notDefault ).map( name => {
		const declaration = module.traceExport( name );
		const rendered = declaration.render( true );

		return rendered === name ?
			name :
			`${rendered} as ${name}`;
	});

	let exportBlock = specifiers.length ? `export { ${specifiers.join(', ')} };` : '';

	const defaultExport = module.exports.default || module.reexports.default;
	if ( defaultExport ) {
		exportBlock += `export default ${module.traceExport( 'default' ).render( true )};`;
	}

	if ( exportBlock ) {
		magicString.append( '\n\n' + exportBlock.trim() );
	}

	return magicString.trim();
}

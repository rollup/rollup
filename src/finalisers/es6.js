import { keys } from '../utils/object.js';

function notDefault ( name ) {
	return name !== 'default';
}

export default function es6 ( bundle, magicString ) {
	const importBlock = bundle.externalModules
		.map( module => {
			const specifiers = [];
			const importedNames = keys( module.declarations )
				.filter( name => name !== '*' && name !== 'default' );

			if ( module.declarations.default ) {
				specifiers.push( module.name );
			}

			if ( module.declarations['*'] ) {
				specifiers.push( `* as ${module.name}` );
			}

			if ( importedNames.length ) {
				specifiers.push( `{ ${importedNames.join( ', ' )} }` );
			}

			return specifiers.length ?
				`import ${specifiers.join( ', ' )} from '${module.id}';` :
				`import '${module.id}';`;
		})
		.join( '\n' );

	if ( importBlock ) {
		magicString.prepend( importBlock + '\n\n' );
	}

	const module = bundle.entryModule;

	const specifiers = module.getExports().filter( notDefault ).map( name => {
		const declaration = module.traceExport( name );

		return declaration.name === name ?
			name :
			`${declaration.name} as ${name}`;
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

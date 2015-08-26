import { blank, keys } from '../utils/object';

function uniqueNames ( declarations ) {
	let uniques = blank();

	declarations
		.filter( declaration => !/^(default|\*)$/.test( declaration.name ) )
		.forEach( declaration => uniques[ declaration.name ] = true );

	return keys( uniques );
}

function notDefault ( name ) {
	return name !== 'default';
}

export default function es6 ( bundle, magicString ) {
	const importBlock = bundle.externalModules
		.map( module => {
			const specifiers = [];

			if ( module.exports.inScope( 'default' ) ) {
				specifiers.push( module.exports.lookup( 'default' ).name );
			}

			if ( module.needsAll ) {
				specifiers.push( '* as ' + module.importedByBundle.filter( declaration =>
					declaration.name === '*' )[0].localName );
			}

			if ( module.needsNamed ) {
				specifiers.push( '{ ' + uniqueNames( module.importedByBundle )
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

	const module = bundle.entryModule;

	const specifiers = bundle.toExport.filter( notDefault ).map( name => {
		const id = bundle.exports.lookup( name );

		return id.name === name ?
			name :
			`${id.name} as ${name}`;
	});

	let exportBlock = specifiers.length ? `export { ${specifiers.join(', ')} };` : '';

	const defaultExport = module.exports.lookup( 'default' );
	if ( defaultExport ) {
		exportBlock += `export default ${ defaultExport.name };`;
	}

	if ( exportBlock ) {
		magicString.append( '\n\n' + exportBlock.trim() );
	}

	return magicString.trim();
}


function specifiersFor ( scope ) {
	return scope.getNames()
		.filter( notDefault )
		.map( name => {
			const id = scope.lookup( name );

			return name !== id.name ? `${name} as ${id.name}` : name;
		});
}

function notDefault ( name ) {
	return name !== 'default';
}

export default function es6 ( bundle, magicString ) {
	const importBlock = bundle.externalModules
		.map( module => {
			const specifiers = [];

			const id = module.exports.lookup( 'default' );

			if ( id ) {
				specifiers.push( id.name );
			}

			if ( module.needsAll ) {
				specifiers.push( '* as ' + module.importedByBundle.filter( declaration =>
					declaration.name === '*' )[0].localName );
			}

			if ( module.needsNamed ) {
				specifiers.push( '{ ' + specifiersFor( module.exports )
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

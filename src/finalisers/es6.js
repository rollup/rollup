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

function getSpecifiers ( exports, replacements ) {
	return keys( exports ).filter( notDefault ).map( name => {
		const specifier = exports[ name ];
		console.log( 'specifier', specifier )
		const canonicalName = replacements[ specifier.localName ] || specifier.localName;

		return canonicalName === name ?
			name :
			`${canonicalName} as ${name}`;
	});
}

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

	const specifiers = getSpecifiers( module.exports, module.replacements )
		.concat( getSpecifiers( module.reexports, module.replacements ) );

	let exportBlock = specifiers.length ? `export { ${specifiers.join(', ')} };` : '';

	const defaultExport = module.exports.default || module.reexports.default;
	if ( defaultExport ) {
		exportBlock += `export default ${bundle.traceExport(module,'default')};`;
	}

	if ( exportBlock ) {
		magicString.append( '\n\n' + exportBlock.trim() );
	}

	return magicString.trim();
}

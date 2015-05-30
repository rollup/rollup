import { getName, quoteId } from '../utils/map-helpers';

export default function amd ( bundle, magicString, exportMode, options ) {
	let deps = bundle.externalModules.map( quoteId );
	let args = bundle.externalModules.map( getName );

	if ( exportMode === 'named' ) {
		args.unshift( `exports` );
		deps.unshift( `'exports'` );
	}

	const params =
		( options.moduleId ? `['${options.moduleId}'], ` : `` ) +
		( deps.length ? `[${deps.join( ', ' )}], ` : `` );

	const intro = `define(${params}function (${args.join( ', ' )}) { 'use strict';\n\n`;

	const exports = bundle.entryModule.exports;

	let exportBlock;

	if ( exportMode === 'default' ) {
		exportBlock = `return ${bundle.entryModule.getCanonicalName('default')};`;
	} else {
		exportBlock = bundle.toExport.map( name => {
			return `exports.${name} = ${exports[name].localName};`;
		}).join( '\n' );
	}

	if ( exportBlock ) {
		magicString.append( '\n\n' + exportBlock );
	}

	return magicString
		.trim()
		.indent()
		.append( '\n\n});' )
		.prepend( intro );
}

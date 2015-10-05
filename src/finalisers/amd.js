import { getName, quoteId } from '../utils/map-helpers';
import getInteropBlock from './shared/getInteropBlock';
import getExportBlock from './shared/getExportBlock';

export default function amd ( bundle, magicString, { exportMode, indentString }, options ) {
	let deps = bundle.externalModules.map( quoteId );
	let args = bundle.externalModules.map( getName );

	if ( exportMode === 'named' ) {
		args.unshift( `exports` );
		deps.unshift( `'exports'` );
	}

	const params =
		( options.moduleId ? `'${options.moduleId}', ` : `` ) +
		( deps.length ? `[${deps.join( ', ' )}], ` : `` );

	const useStrict = options.useStrict !== false ? ` 'use strict';` : ``;
	const intro = `define(${params}function (${args.join( ', ' )}) {${useStrict}\n\n`;

	// var foo__default = 'default' in foo ? foo['default'] : foo;
	const interopBlock = getInteropBlock( bundle );
	if ( interopBlock ) magicString.prepend( interopBlock + '\n\n' );

	const exportBlock = getExportBlock( bundle.entryModule, exportMode );
	if ( exportBlock ) magicString.append( '\n\n' + exportBlock );

	return magicString
		.indent( indentString )
		.append( '\n\n});' )
		.prepend( intro );
}

import getInteropBlock from './shared/getInteropBlock';
import getExportBlock from './shared/getExportBlock';

export default function cjs ( bundle, magicString, { exportMode }, options ) {
	let intro = options.useStrict === false ? `` : `'use strict';\n\n`;

	// TODO handle empty imports, once they're supported
	const importBlock = bundle.externalModules
		.map( module => `var ${module.name} = require('${module.id}');`)
		.concat( getInteropBlock( bundle ) )
		.join( '\n' );

	if ( importBlock ) {
		intro += importBlock + '\n\n';
	}

	magicString.prepend( intro );

	const exportBlock = getExportBlock( bundle, exportMode, 'module.exports =' );
	if ( exportBlock ) magicString.append( '\n\n' + exportBlock );

	return magicString;
}

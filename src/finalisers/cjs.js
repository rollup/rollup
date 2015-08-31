import getInteropBlock from './shared/getInteropBlock';
import getExportBlock from './shared/getExportBlock';

export default function cjs ( bundle, magicString, { exportMode }, options ) {
	let intro = options.useStrict === false ? `` : `'use strict';\n\n`;

	// TODO handle empty imports, once they're supported
	let importBlock = bundle.externalModules
		.map( module => `var ${module.name} = require('${module.id}');`)
		.join('\n');

	const interopBlock = getInteropBlock( bundle );

	if ( interopBlock ) {
		importBlock += '\n' + interopBlock;
	}

	if ( importBlock ) {
		intro += importBlock + '\n\n';
	}

	magicString.prepend( intro );

	const exportBlock = getExportBlock( bundle, exportMode, 'module.exports =' );
	if ( exportBlock ) magicString.append( '\n\n' + exportBlock );

	return magicString;
}

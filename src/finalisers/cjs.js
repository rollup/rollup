import getExportBlock from './shared/getExportBlock.js';

export default function cjs ( bundle, magicString, { exportMode }, options ) {
	let intro = options.useStrict === false ? `` : `'use strict';\n\n`;

	const hasDefaultImport = bundle.externalModules.some( mod => mod.declarations.default);

	if (hasDefaultImport) {
		intro += `function _interopRequire (id) { var ex = require(id); return 'default' in ex ? ex['default'] : ex; }\n\n`;
	}

	// TODO handle empty imports, once they're supported
	const importBlock = bundle.externalModules
		.map( module => {
			if ( module.declarations.default ) {
				let importStatement = `var ${module.name} = _interopRequire('${module.id}');`;
				if (module.exportsNames) {
					importStatement += `\nvar ${module.name}__default = ${module.name};`;
				}
				return importStatement;
			} else {
				return `var ${module.name} = require('${module.id}');`;
			}
		})
		.join( '\n' );

	if ( importBlock ) {
		intro += importBlock + '\n\n';
	}

	magicString.prepend( intro );

	const exportBlock = getExportBlock( bundle.entryModule, exportMode, 'module.exports =' );
	if ( exportBlock ) magicString.append( '\n\n' + exportBlock );

	return magicString;
}

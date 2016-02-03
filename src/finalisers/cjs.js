import getExportBlock from './shared/getExportBlock.js';

export default function cjs ( bundle, magicString, { exportMode }, options ) {
	let intro = options.useStrict === false ? `` : `'use strict';\n\n`;

	const hasDefaultImport = bundle.externalModules.some( mod => mod.declarations.default);

	if (hasDefaultImport) {
		intro += `function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }\n\n`;
	}

	// TODO handle empty imports, once they're supported
	const importBlock = bundle.externalModules
		.map( module => {
			if ( module.declarations.default ) {
				if (module.exportsNames) {
					return `var ${module.name} = require('${module.id}');` +
						`\nvar ${module.name}__default = _interopDefault(${module.name});`;
				} else {
					return `var ${module.name} = _interopDefault(require('${module.id}'));`;
				}
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

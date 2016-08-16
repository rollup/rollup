import getExportBlock from './shared/getExportBlock.js';
import esModuleExport from './shared/esModuleExport.js';

export default function cjs ( bundle, magicString, { exportMode }, options ) {
	let intro = ( options.useStrict === false ? `` : `'use strict';\n\n` ) +
	            ( exportMode === 'named' ? `${esModuleExport}\n\n` : '' );

	let needsInterop = false;

	const varOrConst = bundle.varOrConst;

	// TODO handle empty imports, once they're supported
	const importBlock = bundle.externalModules
		.map( module => {
			if ( module.declarations.default ) {
				if ( module.exportsNamespace ) {
					return `${varOrConst} ${module.name} = require('${module.path}');` +
						`\n${varOrConst} ${module.name}__default = ${module.name}['default'];`;
				}

				needsInterop = true;

				if ( module.exportsNames ) {
					return `${varOrConst} ${module.name} = require('${module.path}');` +
						`\n${varOrConst} ${module.name}__default = _interopDefault(${module.name});`;
				}

				return `${varOrConst} ${module.name} = _interopDefault(require('${module.path}'));`;
			} else {
				return `${varOrConst} ${module.name} = require('${module.path}');`;
			}
		})
		.join( '\n' );

	if ( needsInterop ) {
		intro += `function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }\n\n`;
	}

	if ( importBlock ) {
		intro += importBlock + '\n\n';
	}

	magicString.prepend( intro );

	const exportBlock = getExportBlock( bundle.entryModule, exportMode, 'module.exports =' );
	if ( exportBlock ) magicString.append( '\n\n' + exportBlock );
	if ( options.outro ) magicString.append( `\n${options.outro}` );

	return magicString;
}

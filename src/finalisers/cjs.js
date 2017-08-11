import getExportBlock from './shared/getExportBlock.js';
import esModuleExport from './shared/esModuleExport.js';

export default function cjs ( bundle, magicString, { exportMode, intro, outro }, options ) {
	intro = ( options.useStrict === false ? intro : `'use strict';\n\n${intro}` ) +
	        ( exportMode === 'named' && options.legacy !== true ? `${esModuleExport}\n\n` : '' );

	let needsInterop = false;

	const varOrConst = bundle.varOrConst;
	const interop = options.interop !== false;

	// TODO handle empty imports, once they're supported
	const importBlock = bundle.externalModules
		.map( module => {
			if ( interop && module.declarations.default ) {
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
				const activated = Object.keys( module.declarations )
					.filter( name => module.declarations[ name ].activated );

				const needsVar = activated.length || module.reexported;

				return needsVar ?
					`${varOrConst} ${module.name} = require('${module.path}');` :
					`require('${module.path}');`;
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

	const exportBlock = getExportBlock( bundle, exportMode, 'module.exports =' );
	if ( exportBlock ) magicString.append( '\n\n' + exportBlock );
	if ( outro ) magicString.append( outro );

	return magicString;
}

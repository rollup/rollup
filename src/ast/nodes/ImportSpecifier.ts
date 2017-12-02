import Identifier from './Identifier';
import { NodeBase } from './shared/Node';
import { NodeType } from './index';
import MagicString from 'magic-string';
import Module, { ExportDescription, ReexportDescription } from '../../Module';
import ImportDefaultSpecifier from './ImportDefaultSpecifier';
import ImportNamespaceSpecifier from './ImportNamespaceSpecifier';
import { values } from '../../utils/object';
import { RenderOptions } from '../../rollup';

function includeExport (exportDeclaration: ExportDescription) {
	if (exportDeclaration.specifier) {
		exportDeclaration.specifier.includeInBundle();
	} else if (exportDeclaration.declaration) {
		exportDeclaration.declaration.includeInBundle();
	}
}
function includeReexport (reexportDeclaration: ReexportDescription) {
	reexportDeclaration.specifier.includeInBundle();
}

export function includeInBundle (specifier: (ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier)) {
	if ( specifier.included ) return false;
	specifier.included = true;
	const x = specifier.module.imports[specifier.local.name];

	const otherModule = x.module;

	if (otherModule instanceof Module) {
		if (x.name === '*' && specifier.module.graph.includeAllNamespacedInternal) {
			values(otherModule.exports).forEach(includeExport);
			values(otherModule.reexports).forEach(includeReexport);
		} else {
			const exportDeclaration = otherModule.exports && otherModule.exports[ x.name ];
			if ( exportDeclaration ) {
				includeExport(exportDeclaration);
			}
			const reexportDeclaration = otherModule.reexports && otherModule.reexports[ x.name ];
			if ( reexportDeclaration ) {
				includeReexport(reexportDeclaration);
			}
		}
	}
	return true;
}

export default class ImportSpecifier extends NodeBase {
	type: NodeType.ImportSpecifier;
	local: Identifier;
	imported: Identifier;

	includeInBundle () {
		return includeInBundle(this);
	}

	render (code: MagicString, _es: boolean, _options: RenderOptions) {
		if (this.included) {
			return;
		}

		let str = code.original.substr(this.end);
		let matches = str.match(/^\W+/m);
		let clean;
		if (matches) {
			const len = matches[0].length;
			code.remove( this.end, this.end + len );
			clean = true;
		}

		code.remove( this.start, this.end );

		if (clean) {
			return;
		}

		str = code.original.substr(0, this.start);
		matches = str.match(/\W+$/m);
		if (matches) {
			const len = matches[0].length;
			code.remove( this.start - len, this.start );
		}
	}
}

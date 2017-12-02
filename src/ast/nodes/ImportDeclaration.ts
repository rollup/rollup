import { NodeBase } from './shared/Node';
import Literal from './Literal';
import ImportSpecifier from './ImportSpecifier';
import ImportDefaultSpecifier from './ImportDefaultSpecifier';
import ImportNamespaceSpecifier from './ImportNamespaceSpecifier';
import MagicString from 'magic-string';
import { NodeType } from './index';
import { createImportString } from '../../finalisers/es';
import Module from '../../Module';
import { RenderOptions } from '../../rollup';

export default class ImportDeclaration extends NodeBase {
	type: NodeType.ImportDeclaration;
	isImportDeclaration: true;
	specifiers: (ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier)[];
	source: Literal<string>;

	bindChildren () { }

	initialiseNode () {
		this.isImportDeclaration = true;
	}

	hasEffects () {
		if (this.module.resolvedExternalIds[this.source.value]) {
			return true;
		}
		if (!this.specifiers.length) {
			let id = this.module.resolvedIds[this.source.value];
			let module = this.module.graph.moduleById.get(id) as Module;
			if (module.hasEffects()) {
				return true;
			}
		}
		return super.hasEffects.apply( this, arguments );
	}

	includeInBundle () {
		let addedNewNodes = !this.included;
		this.included = true;
		this.specifiers.forEach( node => {
			if ( node.shouldBeIncluded() ) {
				if ( node.includeInBundle() ) {
					addedNewNodes = true;
				}
			}
		} );
		this.source.includeInBundle();
		return addedNewNodes;
	}

	render (code: MagicString, es: boolean, options: RenderOptions) {
		if ( options.preserveModules && this.included && typeof this.source.value === 'string') {
			const externalName = this.module.resolvedExternalIds[this.source.value];
			if (externalName) {
				const externalModule = options.bundle.externalModules.find(module => module.id === externalName);
				if (externalModule && !this.module.renderedExternalModules[externalModule.id]) {
					const externalImportString = createImportString( externalModule, { getPath: options.getPath, node: this } );
					code.overwrite( this.start, this.end, externalImportString );
					this.module.renderedExternalModules[externalModule.id] = externalModule;
					return;
				}
			} else {
				const name = this.module.resolvedIds[this.source.value];
				if (name) {
					const module = this.module.graph.modules.find(module => module.id === name);
					if (!this.module.renderedModules[module.id]) {
						const importString = createImportString( module, { getPath: options.getPath, node: this } );
						code.overwrite( this.start, this.end, importString );
						this.module.renderedModules[module.id] = module;
						return;
					}
				} else {
					return this.eachChild(node => node.render(code, es, options));
				}
			}
		}

		code.remove(this.start, this.next || this.end);
	}
}

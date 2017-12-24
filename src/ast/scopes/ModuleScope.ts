import { forOwn } from '../../utils/object';
import relativeId from '../../utils/relativeId';
import Scope from './Scope';
import LocalVariable from '../variables/LocalVariable';
import { UNKNOWN_ASSIGNMENT } from '../values';
import Module from '../../Module';
import ImportSpecifier from '../nodes/ImportSpecifier';
import Variable from '../variables/Variable';
import NamespaceVariable from '../variables/NamespaceVariable';

export default class ModuleScope extends Scope {
	parent: Scope;
	module: Module;

	constructor (module: Module) {
		super({
			isModuleScope: true,
			parent: module.graph.scope
		});

		this.module = module;
		this.variables.this = new LocalVariable('this', null, UNKNOWN_ASSIGNMENT);
	}

	deshadow (names: Set<string>) {
		let localNames = new Set(names); // Why do we need a copy here?

		forOwn(this.module.imports, specifier => {
			if (specifier.module.isExternal) return;

			const addDeclaration = (declaration: Variable) => {
				if (declaration.isNamespace && !declaration.isExternal) {
					(<NamespaceVariable>declaration).module.getExports().forEach(name => {
						addDeclaration((<NamespaceVariable>declaration).module.traceExport(name));
					});
				}

				localNames.add(declaration.name);
			};

			(<Module>specifier.module).getExports().forEach(name => {
				addDeclaration(specifier.module.traceExport(name));
			});

			if (specifier.name !== '*') {
				const declaration = specifier.module.traceExport(specifier.name);
				if (!declaration) {
					this.module.warn(
						{
							code: 'NON_EXISTENT_EXPORT',
							name: specifier.name,
							source: specifier.module.id,
							message: `Non-existent export '${
								specifier.name
								}' is imported from ${relativeId(specifier.module.id)}`
						},
						specifier.specifier.start
					);
					return;
				}

				const name = declaration.getName(true);
				if (name !== specifier.name) {
					localNames.add(declaration.getName(true));
				}

				if (
					specifier.name !== 'default' &&
					(<ImportSpecifier>specifier.specifier).imported.name !== specifier.specifier.local.name
				) {
					localNames.add((<ImportSpecifier>specifier.specifier).imported.name);
				}
			}
		});

		super.deshadow(localNames);
	}

	findLexicalBoundary () {
		return this;
	}

	findVariable (name: string) {
		if (this.variables[name]) {
			return this.variables[name];
		}

		return this.module.trace(name) || this.parent.findVariable(name);
	}
}

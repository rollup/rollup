import relativeId from '../../utils/relativeId';
import Scope from './Scope';
import LocalVariable from '../variables/LocalVariable';
import { UNKNOWN_EXPRESSION } from '../values';
import Module from '../../Module';
import ImportSpecifier from '../nodes/ImportSpecifier';
import Variable from '../variables/Variable';
import { isNamespaceVariable } from '../variables/NamespaceVariable';
import { isExternalVariable } from '../variables/ExternalVariable';

const addDeclaredNames = (declaration: Variable, names: Set<string>) => {
	if (isNamespaceVariable(declaration) && !isExternalVariable(declaration)) {
		for (const name of declaration.module.getExports())
			addDeclaredNames(declaration.module.traceExport(name), names);
	}
	names.add(declaration.getName());
};

export default class ModuleScope extends Scope {
	parent: Scope;
	module: Module;

	constructor(module: Module) {
		super({
			isModuleScope: true,
			parent: module.graph.scope
		});

		this.module = module;
		this.variables.this = new LocalVariable('this', null, UNKNOWN_EXPRESSION);
	}

	deshadow(names: Set<string>, children = this.children) {
		let localNames = new Set(names);

		for (const importName of Object.keys(this.module.imports)) {
			const specifier = this.module.imports[importName];

			if (specifier.module.isExternal || specifier.module.chunk !== this.module.chunk) continue;

			for (const name of (<Module>specifier.module).getAllExports())
				addDeclaredNames(specifier.module.traceExport(name), localNames);

			if (specifier.name !== '*') {
				const declaration = specifier.module.traceExport(specifier.name);
				if (!declaration) {
					this.module.warn(
						{
							code: 'NON_EXISTENT_EXPORT',
							name: specifier.name,
							source: specifier.module.id,
							message: `Non-existent export '${specifier.name}' is imported from ${relativeId(
								specifier.module.id
							)}`
						},
						specifier.specifier.start
					);
					continue;
				}

				const name = declaration.getName();
				if (name !== specifier.name) {
					localNames.add(name);
				}

				if (
					specifier.name !== 'default' &&
					(<ImportSpecifier>specifier.specifier).imported.name !== specifier.specifier.local.name
				) {
					localNames.add((<ImportSpecifier>specifier.specifier).imported.name);
				}
			}
		}

		super.deshadow(localNames, children);
	}

	findLexicalBoundary() {
		return this;
	}

	findVariable(name: string) {
		if (this.variables[name]) {
			return this.variables[name];
		}

		return this.module.trace(name) || this.parent.findVariable(name);
	}
}

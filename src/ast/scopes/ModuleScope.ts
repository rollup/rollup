import relativeId from '../../utils/relativeId';
import Scope from './Scope';
import LocalVariable from '../variables/LocalVariable';
import { UNKNOWN_EXPRESSION } from '../values';
import Module, { AstContext } from '../../Module';
import ImportSpecifier from '../nodes/ImportSpecifier';
import Variable from '../variables/Variable';
import NamespaceVariable from '../variables/NamespaceVariable';

const addDeclaredNames = (variable: Variable, names: Set<string>) => {
	if (variable.isNamespace && !variable.isExternal) {
		for (const name of (<NamespaceVariable>variable).context.getExports())
			addDeclaredNames((<NamespaceVariable>variable).context.traceExport(name), names);
	}
	names.add(variable.getName());
};

export default class ModuleScope extends Scope {
	parent: Scope;
	context: AstContext;

	constructor(parent: Scope, context: AstContext) {
		super({
			isModuleScope: true,
			parent
		});

		this.context = context;
		this.variables.this = new LocalVariable('this', null, UNKNOWN_EXPRESSION);
	}

	deshadow(names: Set<string>, children = this.children) {
		let localNames = new Set(names);

		for (const importName of Object.keys(this.context.imports)) {
			const importDescription = this.context.imports[importName];

			if (importDescription.module.isExternal || this.context.isCrossChunkImport(importDescription))
				continue;

			for (const name of (<Module>importDescription.module).getAllExports())
				addDeclaredNames(importDescription.module.traceExport(name), localNames);

			if (importDescription.name !== '*') {
				const declaration = importDescription.module.traceExport(importDescription.name);
				if (!declaration) {
					this.context.warn(
						{
							code: 'NON_EXISTENT_EXPORT',
							name: importDescription.name,
							source: importDescription.module.id,
							message: `Non-existent export '${
								importDescription.name
							}' is imported from ${relativeId(importDescription.module.id)}`
						},
						importDescription.specifier.start
					);
					continue;
				}

				const name = declaration.getName();
				if (name !== importDescription.name) {
					localNames.add(name);
				}

				if (
					importDescription.name !== 'default' &&
					(<ImportSpecifier>importDescription.specifier).imported.name !==
						importDescription.specifier.local.name
				) {
					localNames.add((<ImportSpecifier>importDescription.specifier).imported.name);
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

		return this.context.traceVariable(name) || this.parent.findVariable(name);
	}
}

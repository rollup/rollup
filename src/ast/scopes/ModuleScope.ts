import Module, { AstContext } from '../../Module';
import relativeId from '../../utils/relativeId';
import { UNDEFINED_EXPRESSION } from '../values';
import LocalVariable from '../variables/LocalVariable';
import NamespaceVariable from '../variables/NamespaceVariable';
import Variable from '../variables/Variable';
import Scope from './Scope';

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
		super(parent);
		this.context = context;
		this.isModuleScope = true;
		this.variables.this = new LocalVariable('this', null, UNDEFINED_EXPRESSION, context.reassignmentTracker);
		this.variables.undefined = new LocalVariable('undefined', null, UNDEFINED_EXPRESSION, context.reassignmentTracker);
	}

	deshadow(names: Set<string>, children = this.children) {
		const localNames = new Set(names);

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
						importDescription.start
					);
					continue;
				}

				const name = declaration.getName();
				if (name !== importDescription.name) localNames.add(name);

				if (importDescription.name !== 'default' && importDescription.name !== importName)
					localNames.add(importDescription.name);
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

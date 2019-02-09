import { AstContext } from '../../Module';
import ExportDefaultDeclaration from '../nodes/ExportDefaultDeclaration';
import { UNDEFINED_EXPRESSION } from '../values';
import ExportDefaultVariable from '../variables/ExportDefaultVariable';
import ExternalVariable from '../variables/ExternalVariable';
import GlobalVariable from '../variables/GlobalVariable';
import LocalVariable from '../variables/LocalVariable';
import NamespaceVariable from '../variables/NamespaceVariable';
import Variable from '../variables/Variable';
import ChildScope from './ChildScope';
import GlobalScope from './GlobalScope';

const addDeclaredNames = (variable: Variable, names: Set<string>) => {
	if (variable.isNamespace && !variable.isExternal) {
		for (const name of (<NamespaceVariable>variable).context.getExports())
			addDeclaredNames((<NamespaceVariable>variable).context.traceExport(name), names);
	}
	names.add(variable.getName());
};

export default class ModuleScope extends ChildScope {
	parent: GlobalScope;
	context: AstContext;

	constructor(parent: GlobalScope, context: AstContext) {
		super(parent);
		this.context = context;
		this.variables.this = new LocalVariable('this', null, UNDEFINED_EXPRESSION, context);
	}

	addExportDefaultDeclaration(
		name: string,
		exportDefaultDeclaration: ExportDefaultDeclaration,
		context: AstContext
	): ExportDefaultVariable {
		return (this.variables.default = new ExportDefaultVariable(
			name,
			exportDefaultDeclaration,
			context
		));
	}

	addNamespaceMemberAccess(variable: Variable) {
		if (variable instanceof ExternalVariable || variable instanceof GlobalVariable) {
			this.accessedOutsideVariables.add(variable);
		}
	}

	deshadow(esmOrSystem: boolean) {
		// all module level variables are already deshadowed in the chunk
		for (const scope of this.children) scope.deshadow(esmOrSystem);
	}

	findLexicalBoundary() {
		return this;
	}

	findVariable(name: string) {
		if (this.variables[name]) {
			return this.variables[name];
		}

		const variable = this.context.traceVariable(name) || this.parent.findVariable(name);
		if (variable instanceof ExternalVariable || variable instanceof GlobalVariable) {
			this.accessedOutsideVariables.add(variable);
		}
		return variable;
	}
}

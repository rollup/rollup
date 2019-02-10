import { AstContext } from '../../Module';
import ExportDefaultDeclaration from '../nodes/ExportDefaultDeclaration';
import { UNDEFINED_EXPRESSION } from '../values';
import ExportDefaultVariable from '../variables/ExportDefaultVariable';
import ExternalVariable from '../variables/ExternalVariable';
import GlobalVariable from '../variables/GlobalVariable';
import LocalVariable from '../variables/LocalVariable';
import Variable from '../variables/Variable';
import ChildScope from './ChildScope';
import GlobalScope from './GlobalScope';

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

	addNamespaceMemberAccess(name: string, variable: Variable) {
		if (variable instanceof ExternalVariable || variable instanceof GlobalVariable) {
			this.accessedOutsideVariables[name] = variable;
		}
	}

	deconflict() {
		// all module level variables are already deconflicted in the chunk
		for (const scope of this.children) scope.deconflict();
	}

	findLexicalBoundary() {
		return this;
	}

	findVariable(name: string) {
		const knownVariable = this.variables[name] || this.accessedOutsideVariables[name];
		if (knownVariable) {
			return knownVariable;
		}
		const variable = this.context.traceVariable(name) || this.parent.findVariable(name);
		if (variable instanceof ExternalVariable || variable instanceof GlobalVariable) {
			this.accessedOutsideVariables[name] = variable;
		}
		return variable;
	}
}

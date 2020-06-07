import { AstContext } from '../../Module';
import ExportDefaultDeclaration from '../nodes/ExportDefaultDeclaration';
import { UNDEFINED_EXPRESSION } from '../values';
import ExportDefaultVariable from '../variables/ExportDefaultVariable';
import GlobalVariable from '../variables/GlobalVariable';
import LocalVariable from '../variables/LocalVariable';
import Variable from '../variables/Variable';
import ChildScope from './ChildScope';
import GlobalScope from './GlobalScope';

export default class ModuleScope extends ChildScope {
	context: AstContext;
	parent!: GlobalScope;

	constructor(parent: GlobalScope, context: AstContext) {
		super(parent);
		this.context = context;
		this.variables.set('this', new LocalVariable('this', null, UNDEFINED_EXPRESSION, context));
	}

	addExportDefaultDeclaration(
		name: string,
		exportDefaultDeclaration: ExportDefaultDeclaration,
		context: AstContext
	): ExportDefaultVariable {
		const variable = new ExportDefaultVariable(name, exportDefaultDeclaration, context);
		this.variables.set('default', variable);
		return variable;
	}

	addNamespaceMemberAccess(_name: string, variable: Variable) {
		if (variable instanceof GlobalVariable) {
			this.accessedOutsideVariables.set(variable.name, variable);
		}
	}

	deconflict(format: string, exportNamesByVariable: Map<Variable, string[]>) {
		// all module level variables are already deconflicted when deconflicting the chunk
		for (const scope of this.children) scope.deconflict(format, exportNamesByVariable);
	}

	findLexicalBoundary() {
		return this;
	}

	findVariable(name: string) {
		const knownVariable = this.variables.get(name) || this.accessedOutsideVariables.get(name);
		if (knownVariable) {
			return knownVariable;
		}
		const variable = this.context.traceVariable(name) || this.parent.findVariable(name);
		if (variable instanceof GlobalVariable) {
			this.accessedOutsideVariables.set(name, variable);
		}
		return variable;
	}
}

import { AstContext } from '../../Module';
import { NameCollection } from '../../utils/reservedNames';
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
	parent: GlobalScope;

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

	addNamespaceMemberAccess(_name: string, variable: Variable) {
		if (variable instanceof GlobalVariable) {
			this.accessedOutsideVariables[variable.name] = variable;
		}
	}

	deconflict(forbiddenNames: NameCollection) {
		// all module level variables are already deconflicted when deconflicting the chunk
		for (const scope of this.children) scope.deconflict(forbiddenNames);
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
		if (variable instanceof GlobalVariable) {
			this.accessedOutsideVariables[name] = variable;
		}
		return variable;
	}
}

import { AstContext } from '../../Module';
import Identifier from '../nodes/Identifier';
import { UNKNOWN_EXPRESSION } from '../values';
import LocalVariable from '../variables/LocalVariable';
import Scope from './Scope';

export default class ParameterScope extends Scope {
	parent: Scope;
	hoistedBodyVarScope: Scope;

	private parameters: LocalVariable[] = [];
	private context: AstContext;

	constructor(parent: Scope, context: AstContext) {
		super(parent);
		this.context = context;
		this.hoistedBodyVarScope = new Scope(this);
	}

	/**
	 * Adds a parameter to this scope. Parameters must be added in the correct
	 * order, e.g. from left to right.
	 */
	addParameterDeclaration(identifier: Identifier) {
		const name = identifier.name;
		let variable;
		if (name in this.hoistedBodyVarScope.variables) {
			variable = this.hoistedBodyVarScope.variables[name] as LocalVariable;
			variable.addDeclaration(identifier, null);
		} else {
			variable = new LocalVariable(name, identifier, UNKNOWN_EXPRESSION, this.context);
		}
		this.variables[name] = variable;
		this.parameters.push(variable);
		return variable;
	}

	getParameterVariables() {
		return this.parameters;
	}
}
